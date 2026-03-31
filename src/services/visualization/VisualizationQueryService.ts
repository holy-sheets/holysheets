import { AuthClient } from '@/services/google-sheets/types/credentials.type'
import {
  VisualizationResponse,
  VisualizationRow
} from '@/services/visualization/types/visualization.types'

const GVIZ_BASE_URL = 'https://docs.google.com/spreadsheets/d'

export function parseVisualizationResponse(
  body: string
): VisualizationResponse {
  // The response may be wrapped in: google.visualization.Query.setResponse({...});
  // Or it may be pure JSON (with tqx=out:json)
  let jsonString = body.trim()

  // Strip BOM or leading comments like /*O_o*/ BEFORE checking JSONP wrapper
  jsonString = jsonString.replace(/^\/\*.*?\*\/\s*/s, '')

  // Strip JSONP wrapper if present
  const prefix = 'google.visualization.Query.setResponse('
  if (jsonString.startsWith(prefix)) {
    jsonString = jsonString.slice(prefix.length)
    if (jsonString.endsWith(');')) {
      jsonString = jsonString.slice(0, -2)
    } else if (jsonString.endsWith(')')) {
      jsonString = jsonString.slice(0, -1)
    }
  }

  return JSON.parse(jsonString)
}

export function rowToStringArray(
  row: VisualizationRow,
  columnCount: number
): (string | null)[] {
  const result: (string | null)[] = []
  for (let i = 0; i < columnCount; i++) {
    const cell = row.c?.[i]
    if (
      cell === null ||
      cell === undefined ||
      cell.v === null ||
      cell.v === undefined
    ) {
      result.push(null)
    } else {
      // Use formatted value if available, otherwise stringify
      result.push(cell.f ?? String(cell.v))
    }
  }
  return result
}

export function buildGvizUrl(
  spreadsheetId: string,
  sheetName: string,
  gvizQuery: string,
  headerCount: number = 1
): string {
  const url = `${GVIZ_BASE_URL}/${encodeURIComponent(spreadsheetId)}/gviz/tq`
  const params = new URLSearchParams({
    tq: gvizQuery,
    sheet: sheetName,
    headers: String(headerCount),
    tqx: 'out:json'
  })
  return `${url}?${params.toString()}`
}

export function parseGvizResponseBody(
  response: VisualizationResponse
): (string | null)[][] {
  if (response.status === 'error') {
    const msg = response.errors?.map(e => e.detailed_message).join('; ')
    throw new Error(`Visualization API error: ${msg || 'unknown error'}`)
  }
  const columnCount = response.table.cols.length
  return response.table.rows.map(row => rowToStringArray(row, columnCount))
}

export class VisualizationQueryService {
  private readonly spreadsheetId: string
  private readonly auth: AuthClient

  constructor(spreadsheetId: string, auth: AuthClient) {
    this.spreadsheetId = spreadsheetId
    this.auth = auth
  }

  public async query(
    sheetName: string,
    gvizQuery: string,
    headerCount: number = 1
  ): Promise<(string | null)[][]> {
    const fullUrl = buildGvizUrl(
      this.spreadsheetId,
      sheetName,
      gvizQuery,
      headerCount
    )

    const response = await (this.auth as any).request({ url: fullUrl })
    const body =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data)

    const parsed = parseVisualizationResponse(body)
    return parseGvizResponseBody(parsed)
  }
}

export class PublicVisualizationQueryService {
  private readonly spreadsheetId: string

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId
  }

  public async query(
    sheetName: string,
    gvizQuery: string,
    headerCount: number = 1
  ): Promise<(string | null)[][]> {
    const fullUrl = buildGvizUrl(
      this.spreadsheetId,
      sheetName,
      gvizQuery,
      headerCount
    )

    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(
        `Visualization API HTTP error: ${response.status} ${response.statusText}`
      )
    }
    const body = await response.text()
    const parsed = parseVisualizationResponse(body)
    return parseGvizResponseBody(parsed)
  }
}
