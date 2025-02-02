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

  const spreadsheetId = 'spreadsheetId'
  const sheet = 'sheet'
  const headerRow = 1

  beforeEach(() => {
    HeaderService['instance'] = undefined

    sheetsAdapterServiceMock = {
      getSingleRow: vi.fn()
    } as unknown as SheetsAdapterService
    headerService = HeaderService.getInstance(sheetsAdapterServiceMock)
  })

  it('should return headers from cache if available', async () => {
    const headers = [{ header: 'taskId', column: 0 }]
    // Manually set in cache
    headerService['headerListCache'].set(`${spreadsheetId}:${sheet}`, headers)

    const result = await headerService.getHeaders(
      spreadsheetId,
      sheet,
      headerRow
    )
    expect(result).toEqual(headers)
  })

  it('should throw NoHeadersError if no headers are found', async () => {
    // Ensuring the cache is clear
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockResolvedValue([])

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(NoHeadersError)
  })

  it('should throw InvalidHeaderError if any header is empty', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockResolvedValue([
      'header1',
      ''
    ])

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(InvalidHeaderError)
  })

  it('should throw DuplicatedHeaderError if any header is duplicated', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockResolvedValue([
      'header1',
      'header1'
    ])

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(DuplicatedHeaderError)
  })

  it('should return headers if valid headers are found', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockResolvedValue([
      'header1',
      'header2'
    ])

    const result = await headerService.getHeaders(
      spreadsheetId,
      sheet,
      headerRow
    )
    expect(result).toEqual([
      { header: 'header1', column: 0 },
      { header: 'header2', column: 1 }
    ])
  })

  it('should throw SheetNotFoundError if sheet is not found', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockRejectedValue(
      new SheetNotFoundError(sheet)
    )

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(SheetNotFoundError)
  })

  it('should throw AuthenticationError if authentication fails', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockRejectedValue(
      new AuthenticationError('')
    )

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(AuthenticationError)
  })

  it('should throw HolySheetsError for unknown errors', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockRejectedValue(
      new Error('Unknown error')
    )

    await expect(
      headerService.getHeaders(spreadsheetId, sheet, headerRow)
    ).rejects.toThrow(HolySheetsError)
  })

  it('should return header names as array of strings', async () => {
    headerService['headerListCache'].clear()
    ;(sheetsAdapterServiceMock.getSingleRow as any).mockResolvedValue([
      'header1',
      'header2'
    ])

    const result = await headerService.getHeadersArray(
      spreadsheetId,
      sheet,
      headerRow
    )
    expect(result).toEqual(['header1', 'header2'])
  })

  it('should clear cache for specific spreadsheet and sheet', () => {
    headerService['headerListCache'].set(`${spreadsheetId}:${sheet}`, [
      { header: 'taskId', column: 0 }
    ])
    headerService.clearCache(spreadsheetId, sheet)
    expect(
      headerService['headerListCache'].has(`${spreadsheetId}:${sheet}`)
    ).toBe(false)
  })
})
