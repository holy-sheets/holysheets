import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VisualizationQueryService } from '@/services/visualization/VisualizationQueryService'

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
