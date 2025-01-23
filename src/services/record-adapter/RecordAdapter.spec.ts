import { describe, it, expect } from 'vitest'
import { RecordAdapter } from './RecordAdapter'
import { DataTypes } from '@/types/RecordSchema.types'
import { SchemaTypeMismatchError } from '@/errors/SchemaTypeMismatchError'

describe('RecordAdapter', () => {
  it('should convert data to record with string type', () => {
    const data = ['John', 'Doe']
    const options = {
      headerColumns: [
        { header: 'firstName', column: 0 },
        { header: 'lastName', column: 1 }
      ]
    }
    const result = RecordAdapter.toRecord(data, options)
    expect(result).toEqual({ firstName: 'John', lastName: 'Doe' })
  })

  it('should convert data to record with number type', () => {
    const data = ['42']
    const options = {
      schema: [{ key: 'age', type: DataTypes.NUMBER }],
      headerColumns: [{ header: 'age', column: 0 }]
    }
    const result = RecordAdapter.toRecord(data, options)
    expect(result).toEqual({ age: 42 })
  })

  it('should convert data to record with boolean type', () => {
    const data = ['true']
    const options = {
      schema: [{ key: 'isActive', type: DataTypes.BOOLEAN }],
      headerColumns: [{ header: 'isActive', column: 0 }]
    }
    const result = RecordAdapter.toRecord(data, options)
    expect(result).toEqual({ isActive: true })
  })

  it('should convert data to record with date type', () => {
    const data = ['2023-10-01']
    const options = {
      schema: [{ key: 'birthDate', type: DataTypes.DATE }],
      headerColumns: [{ header: 'birthDate', column: 0 }]
    }
    const result = RecordAdapter.toRecord(data, options)
    expect(result).toEqual({ birthDate: new Date('2023-10-01') })
  })

  it('should handle nullable fields', () => {
    const data = ['']
    const options = {
      schema: [{ key: 'middleName', type: DataTypes.STRING, nullable: true }],
      headerColumns: [{ header: 'middleName', column: 0 }]
    }
    const result = RecordAdapter.toRecord(data, options)
    expect(result).toEqual({ middleName: null })
  })

  it('should throw SchemaTypeMismatchError for invalid number', () => {
    const data = ['invalid']
    const options = {
      schema: [{ key: 'age', type: DataTypes.NUMBER }],
      headerColumns: [{ header: 'age', column: 0 }]
    }
    expect(() => RecordAdapter.toRecord(data, options)).toThrow(
      SchemaTypeMismatchError
    )
  })

  it('should throw SchemaTypeMismatchError for invalid boolean', () => {
    const data = ['invalid']
    const options = {
      schema: [{ key: 'isActive', type: DataTypes.BOOLEAN }],
      headerColumns: [{ header: 'isActive', column: 0 }]
    }
    expect(() => RecordAdapter.toRecord(data, options)).toThrow(
      SchemaTypeMismatchError
    )
  })

  it('should throw SchemaTypeMismatchError for invalid date', () => {
    const data = ['invalid']
    const options = {
      schema: [{ key: 'birthDate', type: DataTypes.DATE }],
      headerColumns: [{ header: 'birthDate', column: 0 }]
    }
    expect(() => RecordAdapter.toRecord(data, options)).toThrow(
      SchemaTypeMismatchError
    )
  })
})
