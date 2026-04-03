import { IHolySheetsPublic } from '@/mixins/IHolySheetsPublic'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import {
  parseVisualizationResponse,
  buildGvizUrl
} from '@/services/visualization/VisualizationQueryService'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'

export interface HolySheetsPublicCredentials {
  spreadsheetId: string
}

interface HolySheetsPublicBaseOptions {
  headerRow?: number
  skipSheetValidation?: boolean
}

export class HolySheetsPublicBase<
  RecordType extends object
> implements IHolySheetsPublic<RecordType> {
  public sheet: string = ''
  public spreadsheetId: string
  public headerRow: number = 1
  public skipSheetValidation: boolean = false
  public schema?: RecordSchema<RecordType>
  private readonly cachedHeaders: Map<string, HeaderColumn[]> = new Map()
  private cachedSheetNames: Set<string> | null = null

  constructor(credentials: HolySheetsPublicCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
  }

  public base(table: string, options: HolySheetsPublicBaseOptions = {}): this {
    this.sheet = table
    if (options.headerRow !== undefined) {
      this.headerRow = options.headerRow
    }
    if (options.skipSheetValidation !== undefined) {
      this.skipSheetValidation = options.skipSheetValidation
    }
    return this
  }

  public defineSchema(schema: RecordSchema<RecordType>): this {
    this.schema = schema
    return this
  }

  private buildHtmlViewUrl(): string {
    return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(this.spreadsheetId)}/htmlview`
  }

  private decodeEscapedString(value: string): string {
    return value
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
        String.fromCharCode(Number.parseInt(hex, 16))
      )
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .trim()
  }

  private decodeHtmlEntities(value: string): string {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  private readQuotedString(
    source: string,
    quoteStart: number
  ): { value: string; endIndex: number } | null {
    const quote = source[quoteStart]
    if (quote !== '"' && quote !== "'") {
      return null
    }

    let cursor = quoteStart + 1
    let raw = ''

    while (cursor < source.length) {
      const current = source[cursor]
      if (current === '\\') {
        if (cursor + 1 < source.length) {
          raw += source.slice(cursor, cursor + 2)
          cursor += 2
          continue
        }
        raw += current
        cursor += 1
        continue
      }
      if (current === quote) {
        return { value: raw, endIndex: cursor + 1 }
      }
      raw += current
      cursor += 1
    }

    return null
  }

  private addSheetName(target: Set<string>, raw: string): void {
    const decoded = this.decodeHtmlEntities(this.decodeEscapedString(raw))
    if (decoded.length > 0) {
      target.add(decoded)
    }
  }

  private extractSheetNamesFromItemsPushBlocks(html: string): Set<string> {
    const names = new Set<string>()
    const itemRegex = /items\.push\(\{[\s\S]*?\}\)/gi
    let itemMatch: RegExpExecArray | null = null
    while ((itemMatch = itemRegex.exec(html)) !== null) {
      const block = itemMatch[0]
      const namePropRegex = /\bname\b\s*:\s*/gi
      const propMatch = namePropRegex.exec(block)
      if (!propMatch) {
        continue
      }
      let cursor = namePropRegex.lastIndex
      while (cursor < block.length && /\s/.test(block[cursor])) {
        cursor += 1
      }
      const parsed = this.readQuotedString(block, cursor)
      if (!parsed) {
        continue
      }
      this.addSheetName(names, parsed.value)
    }
    return names
  }

  private extractSheetNamesFromAnchorTabs(html: string): Set<string> {
    const names = new Set<string>()
    const tabAnchorRegex =
      /<a\b[^>]*href="[^"]*gid=-?\d+[^"]*"[^>]*>([\s\S]*?)<\/a>/gi
    let tabMatch: RegExpExecArray | null = null
    while ((tabMatch = tabAnchorRegex.exec(html)) !== null) {
      const text = tabMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      this.addSheetName(names, text)
    }
    return names
  }

  private extractSheetNamesFromHtmlView(html: string): Set<string> {
    const names = this.extractSheetNamesFromItemsPushBlocks(html)
    for (const name of this.extractSheetNamesFromAnchorTabs(html)) {
      names.add(name)
    }
    return names
  }

  private async getPublicSheetNames(): Promise<Set<string>> {
    if (this.cachedSheetNames) {
      return this.cachedSheetNames
    }

    const response = await fetch(this.buildHtmlViewUrl())
    if (!response.ok) {
      throw new Error(
        `Failed to validate sheet name: ${response.status} ${response.statusText}`
      )
    }

    const html = await response.text()
    const names = this.extractSheetNamesFromHtmlView(html)

    if (names.size === 0) {
      throw new Error(
        'Failed to validate sheet name: no worksheet tabs found in public page.'
      )
    }

    this.cachedSheetNames = names
    return names
  }

  private async validateSheetExists(): Promise<void> {
    const sheetNames = await this.getPublicSheetNames()
    if (!sheetNames.has(this.sheet)) {
      throw new SheetNotFoundError(this.sheet)
    }
  }

  public async getHeaders(): Promise<HeaderColumn[]> {
    const cacheKey = `${this.spreadsheetId}:${this.sheet}:${this.headerRow}`
    const cached = this.cachedHeaders.get(cacheKey)
    if (cached) {
      return cached
    }

    if (!this.skipSheetValidation) {
      await this.validateSheetExists()
    }

    const fullUrl = buildGvizUrl(
      this.spreadsheetId,
      this.sheet,
      'SELECT * LIMIT 0',
      this.headerRow
    )

    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch headers: ${response.status} ${response.statusText}`
      )
    }
    const body = await response.text()
    const parsed = parseVisualizationResponse(body)

    if (parsed.status === 'error') {
      const msg = parsed.errors?.map(e => e.detailed_message).join('; ')
      throw new Error(`Visualization API error: ${msg || 'unknown error'}`)
    }

    const headers: HeaderColumn[] = parsed.table.cols.map((col, index) => ({
      header: col.label,
      column: index
    }))

    this.cachedHeaders.set(cacheKey, headers)
    return headers
  }
}
