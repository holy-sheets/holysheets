import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteMany } from './deleteMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { SheetRecord } from '@/types/sheetRecord'

vi.mock('@/core/findMany/findMany')

const mockSheets: IGoogleSheetsService = {
  batchDeleteRows: vi.fn()
} as unknown as IGoogleSheetsService

describe('deleteMany', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheet = 'Sheet1'
  const where: WhereClause<any> = { status: 'inactive' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete records that match the where clause', async () => {
    const records: SheetRecord<{ status: string }>[] = [
      { range: 'A2', row: 2, fields: { status: 'inactive' } },
      { range: 'A4', row: 4, fields: { status: 'inactive' } }
    ]
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(records)

    const result = await deleteMany(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where }
    )

    expect(result).toEqual(records)
    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where }
    )
    expect(mockSheets.batchDeleteRows).toHaveBeenCalledWith(sheet, [1, 3])
  })

  it('should throw an error if no records are found', async () => {
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])

    await expect(
      deleteMany({ spreadsheetId, sheets: mockSheets, sheet }, { where })
    ).rejects.toThrow('No records found to delete.')

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where }
    )
    expect(mockSheets.batchDeleteRows).not.toHaveBeenCalled()
  })

  it('should handle errors thrown by findMany', async () => {
    const errorMessage = 'Test error'
    ;(findMany as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(
      deleteMany({ spreadsheetId, sheets: mockSheets, sheet }, { where })
    ).rejects.toThrow(`Error deleting records: ${errorMessage}`)

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where }
    )
    expect(mockSheets.batchDeleteRows).not.toHaveBeenCalled()
  })

  it('should handle errors thrown by batchDeleteRows', async () => {
    const records: SheetRecord<{ status: string }>[] = [
      { range: 'A2', row: 2, fields: { status: 'inactive' } },
      { range: 'A4', row: 4, fields: { status: 'inactive' } }
    ]
    const errorMessage = 'Test error'
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(records)
    ;(
      mockSheets.batchDeleteRows as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    await expect(
      deleteMany({ spreadsheetId, sheets: mockSheets, sheet }, { where })
    ).rejects.toThrow(`Error deleting records: ${errorMessage}`)

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where }
    )
    expect(mockSheets.batchDeleteRows).toHaveBeenCalledWith(sheet, [1, 3])
  })
})
