import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  VisualizationQueryService,
  PublicVisualizationQueryService
} from '@/services/visualization/VisualizationQueryService'

describe('VisualizationQueryService', () => {
  const spreadsheetId = 'test-spreadsheet-id'

  function makeAuth(responseData: any) {
    return {
      request: vi.fn().mockResolvedValue({ data: responseData })
    } as any
  }

  it('should make authenticated request to GViz endpoint', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [
            { id: 'A', label: 'name', type: 'string' },
            { id: 'B', label: 'age', type: 'number' }
          ],
          rows: [{ c: [{ v: 'John' }, { v: 30 }] }]
        }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    await service.query('Sheet1', 'SELECT *')

    expect(auth.request).toHaveBeenCalledTimes(1)
    const callUrl = auth.request.mock.calls[0][0].url
    expect(callUrl).toContain(spreadsheetId)
    expect(callUrl).toContain('gviz/tq')
    expect(callUrl).toContain('tq=SELECT+*')
    expect(callUrl).toContain('sheet=Sheet1')
  })

  it('should parse GViz JSON response into string arrays', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [
            { id: 'A', label: 'name', type: 'string' },
            { id: 'B', label: 'age', type: 'number' }
          ],
          rows: [
            { c: [{ v: 'John' }, { v: 30 }] },
            { c: [{ v: 'Jane' }, { v: 25 }] }
          ]
        }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([
      ['John', '30'],
      ['Jane', '25']
    ])
  })

  it('should handle JSONP-wrapped response', async () => {
    const jsonData = JSON.stringify({
      version: '0.6',
      reqId: '0',
      status: 'ok',
      table: {
        cols: [{ id: 'A', label: 'name', type: 'string' }],
        rows: [{ c: [{ v: 'Test' }] }]
      }
    })
    const wrapped = `/*O_o*/\ngoogle.visualization.Query.setResponse(${jsonData});`
    const auth = makeAuth(wrapped)

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['Test']])
  })

  it('should handle null cell values', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [
            { id: 'A', label: 'name', type: 'string' },
            { id: 'B', label: 'age', type: 'number' }
          ],
          rows: [{ c: [{ v: 'John' }, null] }, { c: [null, { v: 30 }] }]
        }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([
      ['John', null],
      [null, '30']
    ])
  })

  it('should handle empty table', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [{ id: 'A', label: 'name', type: 'string' }],
          rows: []
        }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([])
  })

  it('should throw on error response', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'error',
        errors: [
          {
            reason: 'invalid_query',
            message: 'Bad query',
            detailed_message: 'Invalid column reference'
          }
        ],
        table: { cols: [], rows: [] }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    await expect(service.query('Sheet1', 'SELECT X')).rejects.toThrow(
      'Visualization API error'
    )
  })

  it('should use formatted value when available', async () => {
    const auth = makeAuth(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [{ id: 'A', label: 'date', type: 'date' }],
          rows: [{ c: [{ v: 'Date(2024,0,15)', f: '1/15/2024' }] }]
        }
      })
    )

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['1/15/2024']])
  })

  it('should handle object response data (non-string)', async () => {
    const auth = makeAuth({
      version: '0.6',
      reqId: '0',
      status: 'ok',
      table: {
        cols: [{ id: 'A', label: 'name', type: 'string' }],
        rows: [{ c: [{ v: 'Test' }] }]
      }
    })

    const service = new VisualizationQueryService(spreadsheetId, auth)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['Test']])
  })
})

describe('PublicVisualizationQueryService', () => {
  const spreadsheetId = 'test-spreadsheet-id'

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function mockFetch(body: string, ok = true) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok,
      status: ok ? 200 : 403,
      statusText: ok ? 'OK' : 'Forbidden',
      text: () => Promise.resolve(body)
    } as Response)
  }

  it('should fetch public data without auth', async () => {
    mockFetch(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [
            { id: 'A', label: 'name', type: 'string' },
            { id: 'B', label: 'age', type: 'number' }
          ],
          rows: [{ c: [{ v: 'John' }, { v: 30 }] }]
        }
      })
    )

    const service = new PublicVisualizationQueryService(spreadsheetId)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['John', '30']])
    expect(fetch).toHaveBeenCalledTimes(1)
    const calledUrl = (fetch as any).mock.calls[0][0] as string
    expect(calledUrl).toContain(spreadsheetId)
    expect(calledUrl).toContain('gviz/tq')
  })

  it('should throw on HTTP error', async () => {
    mockFetch('', false)

    const service = new PublicVisualizationQueryService(spreadsheetId)
    await expect(service.query('Sheet1', 'SELECT *')).rejects.toThrow(
      'Visualization API HTTP error: 403 Forbidden'
    )
  })

  it('should throw on GViz error response', async () => {
    mockFetch(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'error',
        errors: [
          {
            reason: 'invalid_query',
            message: 'Bad',
            detailed_message: 'Invalid query'
          }
        ],
        table: { cols: [], rows: [] }
      })
    )

    const service = new PublicVisualizationQueryService(spreadsheetId)
    await expect(service.query('Sheet1', 'SELECT *')).rejects.toThrow(
      'Visualization API error'
    )
  })

  it('should handle JSONP-wrapped response', async () => {
    const jsonData = JSON.stringify({
      version: '0.6',
      reqId: '0',
      status: 'ok',
      table: {
        cols: [{ id: 'A', label: 'name', type: 'string' }],
        rows: [{ c: [{ v: 'Test' }] }]
      }
    })
    mockFetch(`/*O_o*/\ngoogle.visualization.Query.setResponse(${jsonData});`)

    const service = new PublicVisualizationQueryService(spreadsheetId)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['Test']])
  })

  it('should handle null cell values', async () => {
    mockFetch(
      JSON.stringify({
        version: '0.6',
        reqId: '0',
        status: 'ok',
        table: {
          cols: [
            { id: 'A', label: 'name', type: 'string' },
            { id: 'B', label: 'age', type: 'number' }
          ],
          rows: [{ c: [{ v: 'John' }, null] }]
        }
      })
    )

    const service = new PublicVisualizationQueryService(spreadsheetId)
    const result = await service.query('Sheet1', 'SELECT *')

    expect(result).toEqual([['John', null]])
  })
})
