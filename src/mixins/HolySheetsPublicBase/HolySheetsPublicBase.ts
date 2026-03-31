import { IHolySheetsPublic } from '@/mixins/IHolySheetsPublic'
import { RecordSchema } from '@/types/RecordSchema.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import {
  parseVisualizationResponse,
  buildGvizUrl
} from '@/services/visualization/VisualizationQueryService'

export interface HolySheetsPublicCredentials {
  spreadsheetId: string
}

interface HolySheetsPublicBaseOptions {
  headerRow?: number
}

export class HolySheetsPublicBase<
  RecordType extends object
> implements IHolySheetsPublic<RecordType> {
  public sheet: string = ''
  public spreadsheetId: string
  public headerRow: number = 1
  public schema?: RecordSchema<RecordType>
  private readonly cachedHeaders: Map<string, HeaderColumn[]> = new Map()

  constructor(credentials: HolySheetsPublicCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
  }

  public base(table: string, options: HolySheetsPublicBaseOptions = {}): this {
    this.sheet = table
    if (options.headerRow !== undefined) {
      this.headerRow = options.headerRow
    }
    return this
  }

  public defineSchema(schema: RecordSchema<RecordType>): this {
    this.schema = schema
    return this
  }

  public async getHeaders(): Promise<HeaderColumn[]> {
    const cacheKey = `${this.spreadsheetId}:${this.sheet}:${this.headerRow}`
    const cached = this.cachedHeaders.get(cacheKey)
    if (cached) {
      return cached
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
