import { AuthClient } from '@/services/google-sheets/types/credentials.type'
import {
  VisualizationResponse,
  VisualizationRow
} from '@/services/visualization/types/visualization.types'

const GVIZ_BASE_URL = 'https://docs.google.com/spreadsheets/d'

function parseVisualizationResponse(body: string): VisualizationResponse {
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

function rowToStringArray(
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
    const url = `${GVIZ_BASE_URL}/${encodeURIComponent(this.spreadsheetId)}/gviz/tq`
    const params = new URLSearchParams({
      tq: gvizQuery,
      sheet: sheetName,
      headers: String(headerCount),
      tqx: 'out:json'
    })

    const fullUrl = `${url}?${params.toString()}`

    const response = await (this.auth as any).request({ url: fullUrl })
    const body =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data)

    const parsed = parseVisualizationResponse(body)

    if (parsed.status === 'error') {
      const msg = parsed.errors?.map(e => e.detailed_message).join('; ')
      throw new Error(`Visualization API error: ${msg || 'unknown error'}`)
    }

    const columnCount = parsed.table.cols.length
    return parsed.table.rows.map(row => rowToStringArray(row, columnCount))
  }
}
