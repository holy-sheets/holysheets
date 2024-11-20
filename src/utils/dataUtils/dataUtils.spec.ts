import { describe, it, expect } from 'vitest'
import { decombine, combine } from './dataUtils'
import { SheetHeaders } from '../../types/headers'

describe('decombine', () => {
  it('should deconstruct a record into an array of values based on the headers', () => {
    const record = {
      name: 'John Doe',
      age: '30',
      isActive: 'true'
    }

    const headers: SheetHeaders[] = [
      { column: 'A', name: 'name', index: 0 },
      { column: 'B', name: 'age', index: 1 },
      { column: 'C', name: 'isActive', index: 2 }
    ]

    const result = decombine(record, headers)
    expect(result).toEqual(['John Doe', '30', 'true'])
  })

  it('should return an array with empty strings for invalid types', () => {
    const record = {
      name: 'John Doe',
      age: 30, // Valid
      isActive: undefined // Invalid
    }

    const headers: SheetHeaders[] = [
      { column: 'A', name: 'name', index: 0 },
      { column: 'B', name: 'age', index: 1 },
      { column: 'C', name: 'isActive', index: 2 }
    ]

    const result = decombine(record as any, headers) // eslint-disable-line
    expect(result).toEqual(['John Doe', 30, ''])
  })

  it('should return an empty array if headers are empty', () => {
    const record = { name: 'John Doe', age: '30' }
    const headers: SheetHeaders[] = []

    const result = decombine(record, headers)
    expect(result).toEqual([])
  })
})

describe('combine', () => {
  it('should combine an array of values into a record based on the headers', () => {
    const data = ['John Doe', '30', 'true']

    const headers: SheetHeaders[] = [
      { column: 'A', name: 'name', index: 0 },
      { column: 'B', name: 'age', index: 1 },
      { column: 'C', name: 'isActive', index: 2 }
    ]

    const result = combine<{ name: string; age: string; isActive: string }>(
      data,
      headers
    )
    expect(result).toEqual({ name: 'John Doe', age: '30', isActive: 'true' })
  })

  it('should skip headers that are out of bounds of the data array', () => {
    const data = ['John Doe']

    const headers: SheetHeaders[] = [
      { column: 'A', name: 'name', index: 0 },
      { column: 'B', name: 'age', index: 1 } // This index is out of bounds
    ]

    const result = combine<{ name: string; age: string }>(data, headers)
    expect(result).toEqual({ name: 'John Doe', age: undefined })
  })

  it('should return an empty object if headers are empty', () => {
    const data = ['John Doe', '30']
    const headers: SheetHeaders[] = []

    const result = combine<{}>(data, headers)
    expect(result).toEqual({})
  })
})
