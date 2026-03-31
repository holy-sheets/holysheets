import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HolySheetsPublicBase } from '@/mixins/HolySheetsPublicBase/HolySheetsPublicBase'

describe('HolySheetsPublicBase', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should set spreadsheetId from credentials', () => {
    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    expect(base.spreadsheetId).toBe('test-id')
  })

  it('should set sheet name via base()', () => {
    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    const result = base.base('MySheet')
    expect(base.sheet).toBe('MySheet')
    expect(result).toBe(base)
  })

  it('should set headerRow via options', () => {
    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('MySheet', { headerRow: 2 })
    expect(base.headerRow).toBe(2)
  })

  it('should default headerRow to 1', () => {
    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    expect(base.headerRow).toBe(1)
  })

  it('should accept schema via defineSchema()', () => {
    const base = new HolySheetsPublicBase<{ name: string }>({
      spreadsheetId: 'test-id'
    })
    const schema = [{ key: 'name' as const, type: 'string' as any }]
    const result = base.defineSchema(schema)
    expect(base.schema).toBe(schema)
    expect(result).toBe(base)
  })

  it('should fetch headers via Visualization API', async () => {
    const mockResponse = {
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            version: '0.6',
            reqId: '0',
            status: 'ok',
            table: {
              cols: [
                { id: 'A', label: 'name', type: 'string' },
                { id: 'B', label: 'age', type: 'number' },
                { id: 'C', label: 'city', type: 'string' }
              ],
              rows: []
            }
          })
        )
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')
    const headers = await base.getHeaders()

    expect(headers).toEqual([
      { header: 'name', column: 0 },
      { header: 'age', column: 1 },
      { header: 'city', column: 2 }
    ])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should cache headers for the same sheet', async () => {
    const mockResponse = {
      ok: true,
      text: () =>
        Promise.resolve(
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
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')
    await base.getHeaders()
    await base.getHeaders()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should throw when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow('Failed to fetch headers')
  })

  it('should throw when visualization API returns error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            version: '0.6',
            reqId: '0',
            status: 'error',
            errors: [
              {
                reason: 'invalid_query',
                message: 'Bad query',
                detailed_message: 'Sheet not found'
              }
            ],
            table: { cols: [], rows: [] }
          })
        )
    } as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow(
      'Visualization API error: Sheet not found'
    )
  })
})
