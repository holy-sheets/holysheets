import { describe, it, expect } from 'vitest'
import { RecordPostProcessor } from './RecordPostProcessor'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'

/**
 * Defining a record type for the tests.
 */
type TestRecord = {
  id: number
  name: string
  age: number
  // To test the use of aliases, records may contain alternative keys:
  fullName?: string
  years?: number
}

/**
 * Example records.
 */
const records: TestRecord[] = [
  { id: 1, name: 'Alice', age: 30, fullName: 'Alice', years: 30 },
  { id: 2, name: 'Bob', age: 25, fullName: 'Bob', years: 25 }
]

describe('RecordPostProcessor', () => {
  it('should throw SelectOmitConflictError when both select and omit are provided', () => {
    const params = { records, schema: null }
    const options = { select: ['name'], omit: ['age'] }
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    expect(() => processor.process()).toThrow(SelectOmitConflictError)
  })

  it('should return original records when neither select nor omit is provided', () => {
    const params = { records, schema: null }
    const options = {} // neither select nor omit provided
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    const result = processor.process()
    expect(result).toEqual(records)
  })

  it('should filter keys using select when select is provided and schema is null', () => {
    const params = { records, schema: null }
    const options = { select: ['name', 'age'] }
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    const result = processor.process()
    // It is expected that only the properties "name" and "age" are kept.
    expect(result).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ])
  })

  it('should filter keys using omit when omit is provided and schema is null', () => {
    const params = { records, schema: null }
    const options = { omit: ['age'] }
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    const result = processor.process()
    // It is expected that the property "age" is removed from each record.
    expect(result).toEqual([
      { id: 1, name: 'Alice', fullName: 'Alice', years: 30 },
      { id: 2, name: 'Bob', fullName: 'Bob', years: 25 }
    ])
  })

  it('should use schema alias in filtering with select', () => {
    // Suppose the schema maps "name" to "fullName".
    const schema = [{ key: 'name', as: 'fullName' }]
    const params = { records, schema }
    const options = { select: ['name'] }
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    const result = processor.process()
    // Since the "select" strategy will use the alias, it is expected that the values
    // found in the "fullName" key of the records are returned.
    expect(result).toEqual([{ fullName: 'Alice' }, { fullName: 'Bob' }])
  })

  it('should use schema alias in filtering with omit', () => {
    // Suppose the schema maps "age" to "years".
    const schema = [{ key: 'age', as: 'years' }]
    const params = { records, schema }
    const options = { omit: ['age'] }
    const processor = new RecordPostProcessor<TestRecord>(
      params,
      options as any
    )
    const result = processor.process()
    // Since the "omit" strategy will use the alias "years", it is expected that the property "years" is removed.
    expect(result).toEqual([
      { id: 1, name: 'Alice', age: 30, fullName: 'Alice' },
      { id: 2, name: 'Bob', age: 25, fullName: 'Bob' }
    ])
  })
})
