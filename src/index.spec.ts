// index.spec.ts

import { vi, describe, it, beforeEach, expect } from 'vitest'
import HolySheets from './index'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { GoogleSheetsService } from '@/services/google-sheets/GoogleSheetsService'
import {
  sanitizeOperationResult,
  sanitizeBatchOperationResult
} from './utils/sanitizeResult/sanitizeResult'

// Mock utility functions
vi.mock('./utils/sanitizeResult/sanitizeResult')

// Mock core functions
vi.mock('@/core/insert/insert')
vi.mock('@/core/findFirst/findFirst')
vi.mock('@/core/findMany/findMany')
vi.mock('@/core/updateFirst/updateFirst')
vi.mock('@/core/updateMany/updateMany')
vi.mock('@/core/clearFirst/clearFirst')
vi.mock('@/core/clearMany/clearMany')
vi.mock('@/core/deleteFirst/deleteFirst')
vi.mock('@/core/deleteMany/deleteMany')

// Import mocked core functions
import { insert } from '@/core/insert/insert'
import { findFirst } from '@/core/findFirst/findFirst'
import { findMany } from '@/core/findMany/findMany'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { updateMany } from '@/core/updateMany/updateMany'
import { clearFirst } from '@/core/clearFirst/clearFirst'
import { clearMany } from '@/core/clearMany/clearMany'
import { deleteFirst } from '@/core/deleteFirst/deleteFirst'
import { deleteMany } from '@/core/deleteMany/deleteMany'
import {
  IMetadataService,
  OperationMetadata
} from './services/metadata/IMetadataService'

// Mock core functions
const mockInsert = vi.mocked(insert)
const mockFindFirst = vi.mocked(findFirst)
const mockFindMany = vi.mocked(findMany)
const mockUpdateFirst = vi.mocked(updateFirst)
const mockUpdateMany = vi.mocked(updateMany)
const mockClearFirst = vi.mocked(clearFirst)
const mockClearMany = vi.mocked(clearMany)
const mockDeleteFirst = vi.mocked(deleteFirst)
const mockDeleteMany = vi.mocked(deleteMany)

// Mock utility functions
const mockSanitizeOperationResult = vi.mocked(sanitizeOperationResult)
const mockSanitizeBatchOperationResult = vi.mocked(sanitizeBatchOperationResult)

describe('HolySheets Class', () => {
  let holySheets: HolySheets
  const credentials = {
    spreadsheetId: 'spreadsheet-id',
    auth: {} as any // Mock authentication object
  }

  beforeEach(() => {
    holySheets = new HolySheets(credentials)
    vi.clearAllMocks()
  })

  it('should initialize with the provided credentials', () => {
    expect(holySheets.spreadsheetId).toBe('spreadsheet-id')
    expect(holySheets.sheets).toBeInstanceOf(GoogleSheetsService)
  })

  it('should set the table with the base method', () => {
    const table = 'TestTable'
    const baseInstance = holySheets.base(table)
    expect(baseInstance).not.toBe(holySheets)
    expect(baseInstance.sheet).toBe(table)
    expect(holySheets.sheet).toBe('')
  })

  describe('Method calls and result sanitization', () => {
    let holySheets: HolySheets<{ name: string; email: string; status: string }>

    beforeEach(() => {
      holySheets = new HolySheets(credentials).base('Users')
      vi.clearAllMocks()
    })

    it('should call insert and sanitize the result', async () => {
      const insertResult = {
        data: [{ name: 'Alice', email: 'alice@example.com', status: 'active' }],
        row: 5,
        range: 'A5:B5',
        metadata: undefined
      }
      mockInsert.mockResolvedValueOnce(insertResult)

      const sanitizedResult = { data: insertResult.data }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.insert({ data: insertResult.data })

      expect(mockInsert).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { data: insertResult.data },
        undefined
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(insertResult)
      expect(result).toEqual(sanitizedResult)
    })

    it('should call findFirst and sanitize the result', async () => {
      const findFirstResult = {
        data: { name: 'Bob', email: 'bob@example.com' },
        row: 2,
        range: 'A2:B2',
        metadata: undefined
      }
      mockFindFirst.mockResolvedValueOnce(findFirstResult)

      const sanitizedResult = { data: findFirstResult.data }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.findFirst({
        where: { name: 'Bob' }
      })

      expect(mockFindFirst).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { name: 'Bob' } },
        undefined
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(findFirstResult)
      expect(result).toEqual(sanitizedResult)
    })

    it('should call findMany and sanitize the result', async () => {
      const findManyResult = {
        data: [
          { name: 'Bob', email: 'bob@example.com', status: 'active' },
          { name: 'Alice', email: 'alice@example.com', status: 'active' }
        ],
        rows: [2, 3],
        ranges: ['A2:B2', 'A3:B3'],
        metadata: undefined
      }
      mockFindMany.mockResolvedValueOnce(findManyResult)

      const sanitizedResult = { data: findManyResult.data }
      mockSanitizeBatchOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.findMany({
        where: { status: 'active' }
      })

      expect(mockFindMany).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { status: 'active' } },
        undefined
      )

      expect(mockSanitizeBatchOperationResult).toHaveBeenCalledWith(
        findManyResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should handle metadata inclusion for findFirst correctly', async () => {
      const findFirstResult = {
        data: { name: 'Bob', email: 'bob@example.com', status: 'active' },
        row: 2,
        range: 'A2:B2',
        metadata: {
          operationId: '123',
          timestamp: new Date().toISOString(),
          duration: '100',
          recordsAffected: 1,
          status: 'success',
          operationType: 'find',
          spreadsheetId: 'spreadsheet-id',
          sheetId: 'sheet-id',
          ranges: ['A2:B2']
        } as OperationMetadata
      }
      mockFindFirst.mockResolvedValueOnce(findFirstResult)

      const sanitizedResult = {
        data: findFirstResult.data,
        metadata: findFirstResult.metadata
      }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.findFirst(
        { where: { name: 'Bob' } },
        { includeMetadata: true }
      )

      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { includeMetadata: true }
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(findFirstResult)
      expect(result).toEqual(sanitizedResult)
    })

    it('should handle metadata inclusion for findMany correctly', async () => {
      const findManyResult = {
        data: [
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Alice', email: 'alice@example.com' }
        ],
        rows: [2, 3],
        ranges: ['A2:B2', 'A3:B3'],
        metadata: {} as OperationMetadata
      }
      mockFindMany.mockResolvedValueOnce(findManyResult)

      const sanitizedResult = {
        data: findManyResult.data,
        metadata: findManyResult.metadata
      }
      mockSanitizeBatchOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.findMany(
        { where: { status: 'active' } },
        { includeMetadata: true }
      )

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { includeMetadata: true }
      )

      expect(mockSanitizeBatchOperationResult).toHaveBeenCalledWith(
        findManyResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should propagate errors from core functions', async () => {
      const errorMessage = 'Test error'
      mockFindFirst.mockRejectedValueOnce(new Error(errorMessage))

      await expect(
        holySheets.findFirst({ where: { name: 'Bob' } })
      ).rejects.toThrow(errorMessage)

      expect(mockFindFirst).toHaveBeenCalled()
      expect(mockSanitizeOperationResult).not.toHaveBeenCalled()
    })

    // Similar tests for updateFirst, updateMany, clearFirst, clearMany, deleteFirst, deleteMany

    it('should call updateFirst and sanitize the result', async () => {
      const updateFirstResult = {
        data: { name: 'Bob', email: 'bob@example.com', status: 'inactive' },
        row: 2,
        range: 'A2:B2',
        metadata: undefined
      }
      mockUpdateFirst.mockResolvedValueOnce(updateFirstResult)

      const sanitizedResult = { data: updateFirstResult.data }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.updateFirst({
        where: { name: 'Bob' },
        data: { status: 'inactive' }
      })

      expect(mockUpdateFirst).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { name: 'Bob' }, data: { status: 'inactive' } },
        undefined
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(
        updateFirstResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should call updateMany and sanitize the result', async () => {
      const updateManyResult = {
        data: [
          { name: 'Bob', email: 'bob@example.com', status: 'inactive' },
          { name: 'Alice', email: 'alice@example.com', status: 'inactive' }
        ],
        rows: [2, 3],
        ranges: ['A2:B2', 'A3:B3'],
        metadata: undefined
      }
      mockUpdateMany.mockResolvedValueOnce(updateManyResult)

      const sanitizedResult = { data: updateManyResult.data }
      mockSanitizeBatchOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.updateMany({
        where: { status: 'active' },
        data: { status: 'inactive' }
      })

      expect(mockUpdateMany).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { status: 'active' }, data: { status: 'inactive' } },
        undefined
      )

      expect(mockSanitizeBatchOperationResult).toHaveBeenCalledWith(
        updateManyResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should call clearFirst and sanitize the result', async () => {
      const clearFirstResult = {
        data: { name: 'Bob', email: 'bob@example.com' },
        row: 2,
        range: 'A2:B2',
        metadata: undefined
      }
      mockClearFirst.mockResolvedValueOnce(clearFirstResult)

      const sanitizedResult = { data: clearFirstResult.data }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.clearFirst({
        where: { name: 'Bob' }
      })

      expect(mockClearFirst).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { name: 'Bob' } },
        undefined
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(clearFirstResult)
      expect(result).toEqual(sanitizedResult)
    })

    it('should call clearMany and sanitize the result', async () => {
      const clearManyResult = {
        data: [
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Alice', email: 'alice@example.com' }
        ],
        rows: [2, 3],
        ranges: ['A2:B2', 'A3:B3'],
        metadata: undefined
      }
      mockClearMany.mockResolvedValueOnce(clearManyResult)

      const sanitizedResult = { data: clearManyResult.data }
      mockSanitizeBatchOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.clearMany({
        where: { status: 'inactive' }
      })

      expect(mockClearMany).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { status: 'inactive' } },
        undefined
      )

      expect(mockSanitizeBatchOperationResult).toHaveBeenCalledWith(
        clearManyResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should call deleteFirst and sanitize the result', async () => {
      const deleteFirstResult = {
        data: { name: 'Bob', email: 'bob@example.com' },
        row: 2,
        range: 'A2:B2',
        metadata: undefined
      }
      mockDeleteFirst.mockResolvedValueOnce(deleteFirstResult)

      const sanitizedResult = { data: deleteFirstResult.data }
      mockSanitizeOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.deleteFirst({
        where: { name: 'Bob' }
      })

      expect(mockDeleteFirst).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { name: 'Bob' } },
        undefined
      )

      expect(mockSanitizeOperationResult).toHaveBeenCalledWith(
        deleteFirstResult
      )
      expect(result).toEqual(sanitizedResult)
    })

    it('should call deleteMany and sanitize the result', async () => {
      const deleteManyResult = {
        data: [
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Alice', email: 'alice@example.com' }
        ],
        rows: [2, 3],
        ranges: ['A2:B2', 'A3:B3'],
        metadata: undefined
      }
      mockDeleteMany.mockResolvedValueOnce(deleteManyResult)

      const sanitizedResult = { data: deleteManyResult.data }
      mockSanitizeBatchOperationResult.mockReturnValueOnce(sanitizedResult)

      const result = await holySheets.deleteMany({
        where: { status: 'inactive' }
      })

      expect(mockDeleteMany).toHaveBeenCalledWith(
        {
          spreadsheetId: 'spreadsheet-id',
          sheets: holySheets.sheets,
          sheet: 'Users'
        },
        { where: { status: 'inactive' } },
        undefined
      )

      expect(mockSanitizeBatchOperationResult).toHaveBeenCalledWith(
        deleteManyResult
      )
      expect(result).toEqual(sanitizedResult)
    })
  })
})
