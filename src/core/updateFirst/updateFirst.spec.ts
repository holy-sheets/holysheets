import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { findFirst } from '@/core/findFirst/findFirst'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'
import { OperationResult } from '@/services/metadata/IMetadataService'

// Mock the findFirst function and MetadataService
vi.mock('@/core/findFirst/findFirst')
vi.mock('@/services/metadata/MetadataService')

const mockedFindFirst = vi.mocked(findFirst, true)
const mockedMetadataService = vi.mocked(MetadataService, true)

// Define a mock implementation of IGoogleSheetsService
const mockSheets: IGoogleSheetsService = {
  getValues: vi.fn(),
  batchGetValues: vi.fn(),
  updateValues: vi.fn(),
  batchUpdateValues: vi.fn(),
  clearValues: vi.fn(),
  batchClearValues: vi.fn(),
  deleteRows: vi.fn(),
  batchDeleteRows: vi.fn(),
  getSpreadsheet: vi.fn(),
  getAuth: vi.fn()
  // Add other methods if necessary
}

describe('updateFirst', () => {
  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()

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

    mockedMetadataService.mockReturnValue(
      metadataInstance as unknown as MetadataService
    )
  })

  it('should successfully update the first matching record and return the updated data with metadata when includeMetadata is true', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to return an existing record
    const foundRecord: OperationResult<{ Name: string; Age: string }> = {
      range: 'TestSheet!A2:B2',
      row: 2,
      data: { Name: 'Alice', Age: '30' },
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A:A', 'TestSheet!A2:B2']
      }
    }
    mockedFindFirst.mockResolvedValueOnce(foundRecord)

    // Mock the update operation to resolve successfully
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A2:B2',
      [['Alice', '31']],
      'RAW'
    )

    // Assertion to check the return value of the function
    expect(result).toEqual({
      data: { Name: 'Alice', Age: '31' },
      row: 2,
      range: 'TestSheet!A2:B2',
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A2:B2'],
        error: undefined,
        userId: undefined
      }
    })

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'update',
      spreadsheetId,
      sheetId: sheetName,
      ranges: ['TestSheet!A2:B2'],
      recordsAffected: 1,
      status: 'success',
      duration: '50ms'
    })
  })

  it('should throw an error when no matching record is found and includeMetadata is false', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Bob' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '40' }

    // Mock the findFirst function to return undefined (no record found)
    mockedFindFirst.mockResolvedValueOnce({
      data: undefined,
      row: undefined,
      range: undefined
    })

    // Call the function under test and expect an error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate },
        { includeMetadata: false }
      )
    ).rejects.toThrow('No records found matching the criteria.')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: false }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()
  })

  it('should return failure metadata when no matching record is found and includeMetadata is true', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Bob' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '40' }

    // Mock the findFirst function to return undefined (no record found)
    mockedFindFirst.mockResolvedValueOnce({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A:A'],
        error: ErrorMessages[ErrorCode.NoRecordFound]
      }
    })

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()

    // Check the result
    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A:A'],
        error: 'No records found matching the criteria.',
        userId: undefined
      }
    })

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'update',
      spreadsheetId,
      sheetId: sheetName,
      ranges: ['TestSheet!A:A'],
      recordsAffected: 0,
      status: 'failure',
      error: 'No records found matching the criteria.',
      duration: '50ms'
    })
  })

  it('should propagate errors thrown by the findFirst function when includeMetadata is false', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Eve' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to throw an error
    const findFirstError = new Error('findFirst encountered an error')
    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate },
        { includeMetadata: false }
      )
    ).rejects.toThrow('findFirst encountered an error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: false }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()
  })

  it('should return failure metadata when findFirst throws an error and includeMetadata is true', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Eve' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to throw an error
    const findFirstError = new Error('findFirst encountered an error')
    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()

    // Check the result
    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [],
        error: 'findFirst encountered an error',
        userId: undefined
      }
    })

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'update',
      spreadsheetId,
      sheetId: sheetName,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'findFirst encountered an error',
      duration: '50ms'
    })
  })

  it('should propagate errors thrown by the Google Sheets API during the update when includeMetadata is false', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = {
      Name: 'Charlie'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '35' }

    // Mock the findFirst function to return an existing record
    const foundRecord: OperationResult<{ Name: string; Age: string }> = {
      range: 'TestSheet!A3:B3',
      row: 3,
      data: { Name: 'Charlie', Age: '34' }
    }
    mockedFindFirst.mockResolvedValueOnce(foundRecord)

    // Mock the update operation to throw an error
    const updateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(updateError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Google Sheets API Error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A3:B3',
      [['Charlie', '35']],
      'RAW'
    )
  })

  it('should return failure metadata when Google Sheets API throws an error during the update and includeMetadata is true', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = {
      Name: 'Charlie'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '35' }

    // Mock the findFirst function to return an existing record
    const foundRecord: OperationResult<{ Name: string; Age: string }> = {
      range: 'TestSheet!A3:B3',
      row: 3,
      data: { Name: 'Charlie', Age: '34' },
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A:A', 'TestSheet!A3:B3']
      }
    }
    mockedFindFirst.mockResolvedValueOnce(foundRecord)

    // Mock the update operation to throw an error
    const updateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(updateError)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A3:B3',
      [['Charlie', '35']],
      'RAW'
    )

    // Check the result
    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [],
        error: 'Google Sheets API Error',
        userId: undefined
      }
    })

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'update',
      spreadsheetId,
      sheetId: sheetName,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'Google Sheets API Error',
      duration: '50ms'
    })
  })
})
