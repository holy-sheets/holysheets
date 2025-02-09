import { describe, it, expect, vi } from 'vitest'
import { RecordAdapter } from './RecordAdapter'
import { DataTypes } from '@/types/RecordSchema.types'
import { SchemaTypeMismatchError } from '@/errors/SchemaTypeMismatchError'
import { FieldRequiredNoDefaultError } from '@/errors/FieldRequiredNoDefaultError'
import { NullableError } from '@/errors/NullableError'
import { NullableRequiredError } from '@/errors/NullableRequiredError'
import * as setValueModule from './helpers/setValue'
import { InvalidBooleanValueError } from '@/errors/InvalidBooleanValueError'

// ------------------------------------------------
// toRecord tests
// ------------------------------------------------
describe('RecordAdapter - toRecord', () => {
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

// ------------------------------------------------
// fromRecord tests
// ------------------------------------------------
describe('RecordAdapter - fromRecord', () => {
  it('returns an empty array if headerColumns is empty', () => {
    const result = RecordAdapter.fromRecord({}, { headerColumns: [] })
    expect(result).toEqual([])
  })

  it('places string values in correct columns', () => {
    const record = { firstName: 'John', lastName: 'Doe' }
    const options = {
      headerColumns: [
        { header: 'firstName', column: 0 },
        { header: 'lastName', column: 1 }
      ]
    }
    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual(['John', 'Doe'])
  })

  it('converts boolean fields to TRUE/FALSE', () => {
    const record = { isActive: true, isPublic: false }
    const options = {
      schema: [
        { key: 'isActive', type: DataTypes.BOOLEAN },
        { key: 'isPublic', type: DataTypes.BOOLEAN }
      ],
      headerColumns: [
        { header: 'isActive', column: 0 },
        { header: 'isPublic', column: 1 }
      ]
    }
    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual(['TRUE', 'FALSE'])
  })

  it('should throw InvalidBooleanValueError for invalid boolean', () => {
    const record = { isActive: 'invalid' }
    const options = {
      schema: [{ key: 'isActive', type: DataTypes.BOOLEAN }],
      headerColumns: [{ header: 'isActive', column: 0 }]
    }
    expect(() => RecordAdapter.fromRecord(record, options)).toThrow(
      InvalidBooleanValueError
    )
  })

  it('converts date fields to ISO string', () => {
    const dateObj = new Date('2023-10-01')
    const record = { birthDate: dateObj }
    const options = {
      schema: [{ key: 'birthDate', type: DataTypes.DATE }],
      headerColumns: [{ header: 'birthDate', column: 0 }]
    }
    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual([dateObj.toISOString()])
  })

  it('converts number fields to string', () => {
    const record = { age: 42 }
    const options = {
      schema: [{ key: 'age', type: DataTypes.NUMBER }],
      headerColumns: [{ header: 'age', column: 0 }]
    }
    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual(['42'])
  })

  it('returns null in array if finalValue is null', () => {
    const record = { middleName: null }
    const options = {
      schema: [{ key: 'middleName', type: DataTypes.STRING, nullable: true }],
      headerColumns: [{ header: 'middleName', column: 0 }]
    }
    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual([null])
  })

  it('throws FieldRequiredNoDefaultError if required, not nullable, and no default', () => {
    const record = { name: undefined }
    const options = {
      schema: [{ key: 'name', required: true, nullable: false }],
      headerColumns: [{ header: 'name', column: 0 }]
    }

    expect(() => RecordAdapter.fromRecord(record, options)).toThrowError(
      FieldRequiredNoDefaultError
    )
  })

  it('throws NullableError if rawValue is null but not nullable', () => {
    const record = { name: null }
    const options = {
      schema: [{ key: 'name', required: false, nullable: false }],
      headerColumns: [{ header: 'name', column: 0 }]
    }

    expect(() => RecordAdapter.fromRecord(record, options)).toThrowError(
      NullableError
    )
  })

  it('throws NullableRequiredError if the field is both nullable and required', () => {
    const record = { name: undefined }
    const options = {
      schema: [{ key: 'name', required: true, nullable: true }],
      headerColumns: [{ header: 'name', column: 0 }]
    }

    expect(() => RecordAdapter.fromRecord(record, options)).toThrowError(
      NullableRequiredError
    )
  })

  it('uses the defaultValue if value is undefined and nullable is true', () => {
    const record = { name: undefined }
    const options = {
      schema: [
        {
          key: 'name',
          required: false,
          nullable: true,
          default: 'defaultName'
        }
      ],
      headerColumns: [{ header: 'name', column: 0 }]
    }

    const result = RecordAdapter.fromRecord(record, options)
    expect(result).toEqual(['defaultName'])
  })

  it('throws SchemaTypeMismatchError if setValue throws an unknown error', () => {
    const record = { foo: 'bar' }
    const options = {
      schema: [{ key: 'foo', nullable: false, required: false }],
      headerColumns: [{ header: 'foo', column: 0 }]
    }

    // Spy on setValue to throw an unknown error
    const spy = vi.spyOn(setValueModule, 'setValue').mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    expect(() => RecordAdapter.fromRecord(record, options)).toThrowError(
      SchemaTypeMismatchError
    )

    spy.mockRestore()
  })
})
