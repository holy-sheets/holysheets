import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findFirst } from './findFirst'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import type { WhereClause } from '@/types/where'
import type { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import { createSingleColumnRange } from '@/utils/rangeUtils/rangeUtils'
import type { CellValue } from '@/types/cellValue'
import type { SheetRecord } from '@/types/sheetRecord'
import { SheetColumn } from '@/types/headers'

// Mock the utility modules
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/where/where')
vi.mock('@/utils/dataUtils/dataUtils')
vi.mock('@/utils/columnUtils/columnUtils')
vi.mock('@/utils/rangeUtils/rangeUtils')

const mockSheets: IGoogleSheetsService = {
  getValues: vi.fn()
} as unknown as IGoogleSheetsService

describe('findFirst', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheet = 'Sheet1'
  const where: WhereClause<{ status: string }> = { status: 'inactive' }
  const select: SelectClause<{ status: string }> = { status: true }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock implementations for indexToColumn and createSingleColumnRange
    const mockedIndexToColumn = vi.mocked(indexToColumn)
    const mockedCreateSingleColumnRange = vi.mocked(createSingleColumnRange)

    // Mock indexToColumn to return 'A' when called with 0
    mockedIndexToColumn.mockImplementation((index: number): SheetColumn => {
      const columns: SheetColumn[] = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ]
      return columns[index] || 'A'
    })

    // Mock createSingleColumnRange to return 'Sheet1!A:A' when called with sheet and column 'A'
    mockedCreateSingleColumnRange.mockImplementation(({ sheet, column }) => {
      return `${sheet}!${column}:${column}`
    })
  })

  it('should return the first matching record', async () => {
    const headers = [{ name: 'status', column: 'A' }]
    const values: CellValue[][] = [['inactive'], ['active']]
    const rowValues: CellValue[][] = [['inactive']]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      rowValues
    )
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockReturnValueOnce(true)
    ;(combine as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      status: 'inactive'
    })

    const result = await findFirst(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select }
    )

    expect(result).toEqual({
      range: `${sheet}!A1:A1`,
      row: 1,
      data: { status: 'inactive' }
    })
    expect(getHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A1:A1`)
  })

  it('should return undefined if no matching record is found', async () => {
    const headers = [{ name: 'status', column: 'A' }]
    const values: CellValue[][] = [['active']]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)

    const result = await findFirst(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select }
    )

    expect(result).toBeUndefined()
    expect(getHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
  })

  it('should throw an error if header is not found', async () => {
    const headers: { name: string; column: string }[] = []

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)

    await expect(
      findFirst({ spreadsheetId, sheets: mockSheets, sheet }, { where, select })
    ).rejects.toThrow(`Header not found for column status`)

    expect(getHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
  })

  it('should handle errors thrown by getValues', async () => {
    const headers = [{ name: 'status', column: 'A' }]
    const errorMessage = 'Test error'

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(
      findFirst({ spreadsheetId, sheets: mockSheets, sheet }, { where, select })
    ).rejects.toThrow(`Error finding data: ${errorMessage}`)

    expect(getHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
  })
})
