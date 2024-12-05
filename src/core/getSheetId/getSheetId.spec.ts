import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSheetId } from './getSheetId'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

// Mock the services
vi.mock('@/services/metadata/MetadataService')

describe('getSheetId', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheetTitle = 'Sheet1'
  let mockSheetsService: IGoogleSheetsService
  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the IGoogleSheetsService
    mockSheetsService = {
      getSpreadsheet: vi.fn()
    } as unknown as IGoogleSheetsService

    // Mock the MetadataService instance
    metadataInstance = {
      calculateDuration: vi.fn().mockReturnValue('50ms'),
      createMetadata: vi.fn().mockImplementation(options => ({
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: options.duration || '50ms',
        recordsAffected: options.recordsAffected,
        status: options.status,
        operationType: options.operationType,
        spreadsheetId: options.spreadsheetId,
        sheetId: options.sheetId,
        ranges: options.ranges,
        error: options.error,
        userId: options.userId
      }))
    }
    ;(MetadataService as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      metadataInstance as unknown as MetadataService
    )

    // Mock ErrorMessages
    ;(ErrorMessages as any)[ErrorCode.NoRecordFound] =
      'No sheet found with the specified title.'
    ;(ErrorMessages as any)[ErrorCode.UnknownError] =
      'An unknown error occurred while retrieving sheet ID.'
  })

  it('should retrieve the sheet ID and return metadata on success', async () => {
    // Mock the getSpreadsheet method
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      sheets: [
        {
          properties: {
            title: sheetTitle,
            sheetId: 123456
          }
        }
      ]
    })

    const result = await getSheetId(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        title: sheetTitle
      },
      {
        includeMetadata: true
      }
    )

    expect(result).toEqual({
      data: 123456,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'success',
        operationType: 'getSheetId',
        spreadsheetId,
        sheetId: sheetTitle,
        ranges: [],
        error: undefined,
        userId: undefined
      }
    })
  })

  it('should return metadata with error when sheet is not found', async () => {
    // Mock the getSpreadsheet method to return no matching sheets
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      sheets: [
        {
          properties: {
            title: 'OtherSheet',
            sheetId: 654321
          }
        }
      ]
    })

    const result = await getSheetId(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        title: sheetTitle
      },
      {
        includeMetadata: true
      }
    )

    expect(result).toEqual({
      data: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'getSheetId',
        spreadsheetId,
        sheetId: sheetTitle,
        ranges: [],
        error: `No sheet found with title: ${sheetTitle}`,
        userId: undefined
      }
    })
  })

  it('should throw an error when includeMetadata is false and sheet is not found', async () => {
    // Mock the getSpreadsheet method to return no matching sheets
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      sheets: [
        {
          properties: {
            title: 'OtherSheet',
            sheetId: 654321
          }
        }
      ]
    })

    await expect(
      getSheetId(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          title: sheetTitle
        },
        {
          includeMetadata: false
        }
      )
    ).rejects.toThrow(`No sheet found with title: ${sheetTitle}`)
  })

  it('should handle errors from getSpreadsheet and return metadata', async () => {
    const errorMessage = 'API Error'
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error(errorMessage))

    const result = await getSheetId(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        title: sheetTitle
      },
      {
        includeMetadata: true
      }
    )

    expect(result).toEqual({
      data: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'getSheetId',
        spreadsheetId,
        sheetId: sheetTitle,
        ranges: [],
        error: errorMessage,
        userId: undefined
      }
    })
  })

  it.skip('should throw an error when includeMetadata is false and getSpreadsheet fails', async () => {
    const errorMessage = 'API Error'
    ;(
      mockSheetsService.getSpreadsheet as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error(errorMessage))

    await expect(
      getSheetId(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          title: sheetTitle
        },
        {
          includeMetadata: false
        }
      )
    ).rejects.toThrow(expect.stringContaining(errorMessage))
  })
})
