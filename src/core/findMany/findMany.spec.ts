import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findMany } from './findMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import {
  createSingleColumnRange,
  createSingleRowRange
} from '@/utils/rangeUtils/rangeUtils'

// Mock the utility modules
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/where/where')
vi.mock('@/utils/dataUtils/dataUtils')
vi.mock('@/utils/rangeUtils/rangeUtils')

const mockSheetsService = {
  getValues: vi.fn(),
  batchGetValues: vi.fn()
} as unknown as IGoogleSheetsService

describe('findMany', () => {
  const params = {
    spreadsheetId: 'test-spreadsheet-id',
    sheets: mockSheetsService,
    sheet: 'Sheet1'
  }

  const options = {
    where: { Name: 'Alice' },
    select: { Name: true, Age: true }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find multiple records that match the where clause', async () => {
    const headers = [
      { name: 'Name', column: 'A' },
      { name: 'Age', column: 'B' }
    ]

    const values = [['Alice'], ['Bob'], ['Alice']]
    const rowIndexes = [0, 2]
    const ranges = ['Sheet1!A1:B1', 'Sheet1!A3:B3']
    const batchGetResponse = {
      valueRanges: [{ values: [['Alice', 30]] }, { values: [['Alice', 25]] }]
    }

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(values)
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockImplementation(
      (filter, value) => value === 'Alice'
    )
    ;(createSingleRowRange as ReturnType<typeof vi.fn>).mockImplementation(
      ({ row }) => ranges[rowIndexes.indexOf(row - 1)]
    )
    ;(
      mockSheetsService.batchGetValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(batchGetResponse)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (values, headers) => {
        const record: Record<string, any> = {}
        headers.forEach(
          (header: { name: string; column: string }, index: number) => {
            record[header.name] = values[index]
          }
        )
        return record
      }
    )

    const result = await findMany(params, options)

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
    expect(checkWhereFilter).toHaveBeenCalledTimes(3)
    expect(createSingleRowRange).toHaveBeenCalledTimes(2)
    expect(mockSheetsService.batchGetValues).toHaveBeenCalledWith(ranges)
    expect(combine).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      { range: 'Sheet1!A1:B1', row: 1, data: { Name: 'Alice', Age: 30 } },
      { range: 'Sheet1!A3:B3', row: 3, data: { Name: 'Alice', Age: 25 } }
    ])
  })

  it('should return an empty array if no records match the where clause', async () => {
    const headers = [{ name: 'Name', column: 'A' }]
    const values = [['Bob'], ['Charlie']]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(values)
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockImplementation(
      (filter, value) => value === 'Alice'
    )

    const result = await findMany(params, options)

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
    expect(checkWhereFilter).toHaveBeenCalledTimes(2)
    expect(result).toEqual([])
  })

  it('should throw an error if header is not found for the where clause column', async () => {
    const headers = [{ name: 'Age', column: 'B' }]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)

    await expect(findMany(params, options)).rejects.toThrow(
      'Header not found for column Name'
    )

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
  })

  it('should handle error when getting headers', async () => {
    const errorMessage = 'Test error'

    ;(getHeaders as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(findMany(params, options)).rejects.toThrow(errorMessage)

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
  })

  it('should handle error when getting values', async () => {
    const headers = [{ name: 'Name', column: 'A' }]
    const errorMessage = 'Test error'

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    await expect(findMany(params, options)).rejects.toThrow(
      `Error finding data: ${errorMessage}`
    )

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
  })
})
