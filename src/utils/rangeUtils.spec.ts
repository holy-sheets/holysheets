import { describe, it, expect } from 'vitest'
import {
  createSingleColumnRange,
  createSingleRowRange,
  createMultipleRowsRange,
  createFullRange,
  addSheetToRange
} from './rangeUtils'

describe('rangeUtils', () => {
  describe('createSingleColumnRange', () => {
    it('should create a range for a single column', () => {
      const params = { sheet: 'Sheet1', column: 'B' }
      const expected = 'Sheet1!B:B'
      const result = createSingleColumnRange(params)
      expect(result).toBe(expected)
    })

    it('should handle different sheet and column names', () => {
      const params = { sheet: 'DataSheet', column: 'AA' }
      const expected = 'DataSheet!AA:AA'
      const result = createSingleColumnRange(params)
      expect(result).toBe(expected)
    })

    it('should throw an error if sheet name is missing', () => {
      const params = { sheet: '', column: 'A' }
      expect(() => createSingleColumnRange(params)).toThrow(
        'Sheet name is required.'
      )
    })

    it('should throw an error if column name is missing', () => {
      const params = { sheet: 'Sheet1', column: '' }
      expect(() => createSingleColumnRange(params)).toThrow(
        'Column name is required.'
      )
    })
  })

  describe('createSingleRowRange', () => {
    it('should create a range for a single row', () => {
      const params = { sheet: 'Sheet1', row: 5, lastColumnIndex: 25 } // Z
      const expected = 'Sheet1!A5:Z5'
      const result = createSingleRowRange(params)
      expect(result).toBe(expected)
    })

    it('should handle different sheet names and row numbers', () => {
      const params = { sheet: 'DataSheet', row: 10, lastColumnIndex: 51 } // AZ
      const expected = 'DataSheet!A10:AZ10'
      const result = createSingleRowRange(params)
      expect(result).toBe(expected)
    })

    it('should throw an error if sheet name is missing', () => {
      const params = { sheet: '', row: 5, lastColumnIndex: 25 }
      expect(() => createSingleRowRange(params)).toThrow(
        'Sheet name is required.'
      )
    })

    it('should throw an error if row number is not positive', () => {
      const params = { sheet: 'Sheet1', row: 0, lastColumnIndex: 25 }
      expect(() => createSingleRowRange(params)).toThrow(
        'Row number must be positive.'
      )
    })

    it('should throw an error if last column index is negative', () => {
      const params = { sheet: 'Sheet1', row: 5, lastColumnIndex: -1 }
      expect(() => createSingleRowRange(params)).toThrow(
        'Last column index must be non-negative.'
      )
    })
  })

  describe('createMultipleRowsRange', () => {
    it('should create a range for multiple rows', () => {
      const params = {
        sheet: 'Sheet1',
        startRow: 2,
        endRow: 5,
        lastColumnIndex: 25
      } // Z
      const expected = 'Sheet1!A2:Z5'
      const result = createMultipleRowsRange(params)
      expect(result).toBe(expected)
    })

    it('should handle different sheet names and row ranges', () => {
      const params = {
        sheet: 'DataSheet',
        startRow: 10,
        endRow: 20,
        lastColumnIndex: 51
      } // AZ
      const expected = 'DataSheet!A10:AZ20'
      const result = createMultipleRowsRange(params)
      expect(result).toBe(expected)
    })

    it('should throw an error if sheet name is missing', () => {
      const params = { sheet: '', startRow: 2, endRow: 5, lastColumnIndex: 25 }
      expect(() => createMultipleRowsRange(params)).toThrow(
        'Sheet name is required.'
      )
    })

    it('should throw an error if startRow is not positive', () => {
      const params = {
        sheet: 'Sheet1',
        startRow: 0,
        endRow: 5,
        lastColumnIndex: 25
      }
      expect(() => createMultipleRowsRange(params)).toThrow(
        'Invalid row range.'
      )
    })

    it('should throw an error if endRow is less than startRow', () => {
      const params = {
        sheet: 'Sheet1',
        startRow: 5,
        endRow: 2,
        lastColumnIndex: 25
      }
      expect(() => createMultipleRowsRange(params)).toThrow(
        'Invalid row range.'
      )
    })

    it('should throw an error if last column index is negative', () => {
      const params = {
        sheet: 'Sheet1',
        startRow: 2,
        endRow: 5,
        lastColumnIndex: -1
      }
      expect(() => createMultipleRowsRange(params)).toThrow(
        'Last column index must be non-negative.'
      )
    })
  })

  describe('createFullRange', () => {
    it('should create a full range with specified columns and rows', () => {
      const params = {
        sheet: 'Sheet1',
        startColumn: 'A',
        endColumn: 'Z',
        startRow: 1,
        endRow: 10
      }
      const expected = 'Sheet1!A1:Z10'
      const result = createFullRange(params)
      expect(result).toBe(expected)
    })

    it('should handle different sheet names, columns, and row ranges', () => {
      const params = {
        sheet: 'DataSheet',
        startColumn: 'B',
        endColumn: 'AA',
        startRow: 5,
        endRow: 15
      }
      const expected = 'DataSheet!B5:AA15'
      const result = createFullRange(params)
      expect(result).toBe(expected)
    })

    it('should throw an error if sheet name is missing', () => {
      const params = {
        sheet: '',
        startColumn: 'A',
        endColumn: 'Z',
        startRow: 1,
        endRow: 10
      }
      expect(() => createFullRange(params)).toThrow('Sheet name is required.')
    })

    it('should throw an error if start or end columns are missing', () => {
      const params1 = {
        sheet: 'Sheet1',
        startColumn: '',
        endColumn: 'Z',
        startRow: 1,
        endRow: 10
      }
      expect(() => createFullRange(params1)).toThrow(
        'Start and end columns are required.'
      )

      const params2 = {
        sheet: 'Sheet1',
        startColumn: 'A',
        endColumn: '',
        startRow: 1,
        endRow: 10
      }
      expect(() => createFullRange(params2)).toThrow(
        'Start and end columns are required.'
      )
    })

    it('should throw an error if row range is invalid', () => {
      const params = {
        sheet: 'Sheet1',
        startColumn: 'A',
        endColumn: 'Z',
        startRow: 10,
        endRow: 5
      }
      expect(() => createFullRange(params)).toThrow('Invalid row range.')
    })
  })

  describe('addSheetToRange', () => {
    it('should add the sheet name to an existing range', () => {
      const params = { sheet: 'Sheet1', range: 'A1:Z10' }
      const expected = 'Sheet1!A1:Z10'
      const result = addSheetToRange(params)
      expect(result).toBe(expected)
    })

    it('should handle different sheet names and ranges', () => {
      const params = { sheet: 'DataSheet', range: 'B2:AA20' }
      const expected = 'DataSheet!B2:AA20'
      const result = addSheetToRange(params)
      expect(result).toBe(expected)
    })

    it('should throw an error if sheet name is missing', () => {
      const params = { sheet: '', range: 'A1:Z10' }
      expect(() => addSheetToRange(params)).toThrow('Sheet name is required.')
    })

    it('should throw an error if range is missing', () => {
      const params = { sheet: 'Sheet1', range: '' }
      expect(() => addSheetToRange(params)).toThrow('Range is required.')
    })
  })
})
