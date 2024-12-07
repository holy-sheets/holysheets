import {
  sanitizeOperationResult,
  sanitizeBatchOperationResult
} from './sanitizeResult'
import {
  OperationResult,
  BatchOperationResult,
  OperationMetadata
} from '@/services/metadata/IMetadataService'

describe('sanitizeOperationResult', () => {
  it('should remove row and range keys and keep metadata if defined', () => {
    const result: OperationResult<string> = {
      data: 'test data',
      metadata: {} as OperationMetadata,
      row: 1,
      range: 'A1'
    }
    const sanitized = sanitizeOperationResult(result)
    expect(sanitized).toEqual({
      data: 'test data',
      metadata: {}
    })
  })

  it('should remove row and range keys and remove metadata if undefined', () => {
    const result: OperationResult<string> = {
      data: 'test data',
      metadata: undefined,
      row: undefined,
      range: undefined
    }
    const sanitized = sanitizeOperationResult(result)
    expect(sanitized).toEqual({
      data: 'test data'
    })
  })
})

describe('sanitizeBatchOperationResult', () => {
  it('should remove rows and ranges keys and keep metadata if defined', () => {
    const result: BatchOperationResult<string> = {
      data: ['test data 1', 'test data 2'],
      metadata: {} as OperationMetadata,
      rows: [1, 2],
      ranges: ['A1', 'B2']
    }
    const sanitized = sanitizeBatchOperationResult(result)
    expect(sanitized).toEqual({
      data: ['test data 1', 'test data 2'],
      metadata: {}
    })
  })

  it('should remove rows and ranges keys and remove metadata if undefined', () => {
    const result: BatchOperationResult<string> = {
      data: ['test data 1', 'test data 2'],
      metadata: undefined,
      rows: undefined,
      ranges: undefined
    }
    const sanitized = sanitizeBatchOperationResult(result)
    expect(sanitized).toEqual({
      data: ['test data 1', 'test data 2']
    })
  })
})
