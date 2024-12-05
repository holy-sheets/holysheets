import {
  sanitizeOperationResult,
  sanitizeBatchOperationResult
} from './sanitizeResult'
import {
  OperationResult,
  BatchOperationResult
} from '@/services/metadata/IMetadataService'

describe('sanitizeOperationResult', () => {
  it('should remove row and range keys and keep metadata if defined', () => {
    const result: OperationResult<string> = {
      data: 'test data',
      metadata: { info: 'test metadata' }
    }
    const sanitized = sanitizeOperationResult(result)
    expect(sanitized).toEqual({
      data: 'test data',
      metadata: { info: 'test metadata' }
    })
  })

  it('should remove row and range keys and remove metadata if undefined', () => {
    const result: OperationResult<string> = {
      data: 'test data',
      metadata: undefined
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
      metadata: { info: 'test metadata' }
    }
    const sanitized = sanitizeBatchOperationResult(result)
    expect(sanitized).toEqual({
      data: ['test data 1', 'test data 2'],
      metadata: { info: 'test metadata' }
    })
  })

  it('should remove rows and ranges keys and remove metadata if undefined', () => {
    const result: BatchOperationResult<string> = {
      data: ['test data 1', 'test data 2'],
      metadata: undefined
    }
    const sanitized = sanitizeBatchOperationResult(result)
    expect(sanitized).toEqual({
      data: ['test data 1', 'test data 2']
    })
  })
})
