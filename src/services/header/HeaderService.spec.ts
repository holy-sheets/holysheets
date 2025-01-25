import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HeaderService } from './HeaderService'
import { NoHeadersError } from '@/errors/NoHeadersError'
import { InvalidHeaderError } from '@/errors/InvalidHeaderError'
import { DuplicatedHeaderError } from '@/errors/DuplicatedHeaderError'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'
import { AuthenticationError } from '@/errors/AuthenticationError'
import { HolySheetsError } from '@/errors/HolySheetsError'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'

describe('HeaderService', () => {
  let sheetsAdapterServiceMock: SheetsAdapterService
  let headerService: HeaderService

  beforeEach(() => {
    sheetsAdapterServiceMock = {
      getSingleRow: vi.fn()
    } as unknown as SheetsAdapterService
    headerService = HeaderService.getInstance(sheetsAdapterServiceMock)
  })

  it('should return headers from cache if available', async () => {
    const spreadsheetId = 'spreadsheetId'
    const sheet = 'sheet'
    const headerRow = 1
    const headers = [{ header: 'taskId', column: 0 }]
    headerService['headerListCache'].set(`${spreadsheetId}:${sheet}`, headers)

    const result = await headerService.getHeaders(
      spreadsheetId,
      sheet,
      headerRow
    )
    expect(result).toEqual(headers)
  })

  it('should throw NoHeadersError if no headers are found', async () => {
    headerService['headerListCache'].clear()
    sheetsAdapterServiceMock.getSingleRow = vi.fn().mockResolvedValue([])

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(NoHeadersError)
  })

  it.skip('should throw InvalidHeaderError if any header is empty', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockResolvedValue(['header1', ''])

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(InvalidHeaderError)
  })

  it.skip('should throw DuplicatedHeaderError if any header is duplicated', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockResolvedValue(['header1', 'header1'])

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(DuplicatedHeaderError)
  })

  it.skip('should return headers if valid headers are found', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockResolvedValue(['header1', 'header2'])

    const result = await headerService.getHeaders('spreadsheetId', 'sheet')
    expect(result).toEqual([
      { header: 'header1', column: 0 },
      { header: 'header2', column: 1 }
    ])
  })

  it.skip('should throw SheetNotFoundError if sheet is not found', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockRejectedValue(new SheetNotFoundError('sheet'))

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(SheetNotFoundError)
  })

  it.skip('should throw AuthenticationError if authentication fails', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockRejectedValue(new AuthenticationError(''))

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(AuthenticationError)
  })

  it.skip('should throw HolySheetsError for unknown errors', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockRejectedValue(new Error('Unknown error'))

    await expect(
      headerService.getHeaders('spreadsheetId', 'sheet')
    ).rejects.toThrow(HolySheetsError)
  })

  it.skip('should return header names as array of strings', async () => {
    sheetsAdapterServiceMock.getSingleRow = vi
      .fn()
      .mockResolvedValue(['header1', 'header2'])

    const result = await headerService.getHeadersArray('spreadsheetId', 'sheet')
    expect(result).toEqual(['header1', 'header2'])
  })

  it.skip('should clear cache for specific spreadsheet and sheet', () => {
    const spreadsheetId = 'spreadsheetId'
    const sheet = 'sheet'
    headerService['headerListCache'].set(`${spreadsheetId}:${sheet}`, [
      { header: 'taskId', column: 0 }
    ])

    headerService.clearCache(spreadsheetId, sheet)
    expect(
      headerService['headerListCache'].has(`${spreadsheetId}:${sheet}`)
    ).toBe(false)
  })
})
