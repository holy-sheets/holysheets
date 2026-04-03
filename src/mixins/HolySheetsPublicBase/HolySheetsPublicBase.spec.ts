import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HolySheetsPublicBase } from '@/mixins/HolySheetsPublicBase/HolySheetsPublicBase'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'

function createJsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve(JSON.stringify(payload))
  } as Response
}

function createErrorResponse(status: number, statusText: string): Response {
  return {
    ok: false,
    status,
    statusText,
    text: () => Promise.resolve('')
  } as Response
}

function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
}

const htmlViewWith = (
  sheetNames: string[],
  options: { spacedNameProp?: boolean } = {}
) => {
  const items = sheetNames
    .map(
      name =>
        options.spacedNameProp
          ? `items.push({ name : "${escapeJsString(name)}" , pageUrl: "https://example.com"})`
          : `items.push({name: "${escapeJsString(name)}", pageUrl: "https://example.com"})`
    )
    .join(';')
  return `<!doctype html><html><body><script>${items}</script></body></html>`
}

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

  it('should set skipSheetValidation via options', () => {
    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('MySheet', { skipSheetValidation: true })
    expect(base.skipSheetValidation).toBe(true)
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
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith(['Sheet1']))
          } as Response
        }
        return createJsonResponse({
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
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')
    const headers = await base.getHeaders()

    expect(headers).toEqual([
      { header: 'name', column: 0 },
      { header: 'age', column: 1 },
      { header: 'city', column: 2 }
    ])
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should cache headers for the same sheet', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith(['Sheet1']))
          } as Response
        }
        return createJsonResponse({
          version: '0.6',
          reqId: '0',
          status: 'ok',
          table: {
            cols: [{ id: 'A', label: 'name', type: 'string' }],
            rows: []
          }
        })
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')
    await base.getHeaders()
    await base.getHeaders()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should throw when worksheet validation fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      createErrorResponse(404, 'Not Found')
    )

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow(
      'Failed to validate sheet name'
    )
  })

  it('should throw SheetNotFoundError when sheet is not in public tabs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(htmlViewWith(['pokemon', 'moves']))
    } as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow(
      new SheetNotFoundError('Sheet1')
    )
  })

  it('should throw when htmlview page has no parsable tabs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('<html><body><p>No tabs</p></body></html>')
    } as Response)

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow(
      'Failed to validate sheet name: no worksheet tabs found in public page.'
    )
  })

  it('should throw when gviz fetch fails after successful worksheet validation', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith(['Sheet1']))
          } as Response
        }
        return createErrorResponse(404, 'Not Found')
      }
    )

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow('Failed to fetch headers')
  })

  it('should throw when visualization API returns error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith(['Sheet1']))
          } as Response
        }
        return createJsonResponse({
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
      }
    )

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Sheet1')

    await expect(base.getHeaders()).rejects.toThrow(
      'Visualization API error: Sheet not found'
    )
  })

  it('should validate sheet name from htmlview metadata', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith(['pokemon', 'moves']))
          } as Response
        }

        return createJsonResponse({
          version: '0.6',
          reqId: '0',
          status: 'ok',
          table: {
            cols: [{ id: 'A', label: 'move_name', type: 'string' }],
            rows: []
          }
        })
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('moves')
    const headers = await base.getHeaders()

    expect(headers).toEqual([{ header: 'move_name', column: 0 }])
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should validate sheet name with escaped quotes in htmlview metadata', async () => {
    const quotedName = 'R&D "Q1"'
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve(htmlViewWith([quotedName]))
          } as Response
        }

        return createJsonResponse({
          version: '0.6',
          reqId: '0',
          status: 'ok',
          table: {
            cols: [{ id: 'A', label: 'name', type: 'string' }],
            rows: []
          }
        })
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base(quotedName)
    const headers = await base.getHeaders()

    expect(headers).toEqual([{ header: 'name', column: 0 }])
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should validate sheet name when name property has extra whitespace', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/htmlview')) {
          return {
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () =>
              Promise.resolve(htmlViewWith(['Pokemon Moves'], { spacedNameProp: true }))
          } as Response
        }

        return createJsonResponse({
          version: '0.6',
          reqId: '0',
          status: 'ok',
          table: {
            cols: [{ id: 'A', label: 'name', type: 'string' }],
            rows: []
          }
        })
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('Pokemon Moves')
    const headers = await base.getHeaders()

    expect(headers).toEqual([{ header: 'name', column: 0 }])
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('skips sheet-name validation fetch when skipSheetValidation=true', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (_input: RequestInfo | URL) => {
        return createJsonResponse({
          version: '0.6',
          reqId: '0',
          status: 'ok',
          table: {
            cols: [{ id: 'A', label: 'name', type: 'string' }],
            rows: []
          }
        })
      })

    const base = new HolySheetsPublicBase({ spreadsheetId: 'test-id' })
    base.base('AnySheetName', { skipSheetValidation: true })
    const headers = await base.getHeaders()

    expect(headers).toEqual([{ header: 'name', column: 0 }])
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
