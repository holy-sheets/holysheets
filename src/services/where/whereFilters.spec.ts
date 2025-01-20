import { describe, it, expect } from 'vitest'
import whereFilters from './whereFilters'

describe('whereFilters', () => {
  it('equals should return true if values are equal', () => {
    expect(whereFilters.equals('test', 'test')).toBe(true)
  })

  it('equals should return false if values are not equal', () => {
    expect(whereFilters.equals('test', 'notTest')).toBe(false)
  })

  it('not should return true if values are not equal', () => {
    expect(whereFilters.not('test', 'notTest')).toBe(true)
  })

  it('not should return false if values are equal', () => {
    expect(whereFilters.not('test', 'test')).toBe(false)
  })

  it('in should return true if value is in array', () => {
    expect(whereFilters.in('test', ['test', 'anotherTest'])).toBe(true)
  })

  it('in should return false if value is not in array', () => {
    expect(whereFilters.in('test', ['anotherTest'])).toBe(false)
  })

  it('notIn should return true if value is not in array', () => {
    expect(whereFilters.notIn('test', ['anotherTest'])).toBe(true)
  })

  it('notIn should return false if value is in array', () => {
    expect(whereFilters.notIn('test', ['test', 'anotherTest'])).toBe(false)
  })

  it('lt should return true if value is less than expected', () => {
    expect(whereFilters.lt('5', 10)).toBe(true)
  })

  it('lt should return false if value is not less than expected', () => {
    expect(whereFilters.lt('15', 10)).toBe(false)
  })

  it('lte should return true if value is less than or equal to expected', () => {
    expect(whereFilters.lte('10', 10)).toBe(true)
  })

  it('lte should return false if value is greater than expected', () => {
    expect(whereFilters.lte('15', 10)).toBe(false)
  })

  it('gt should return true if value is greater than expected', () => {
    expect(whereFilters.gt('15', 10)).toBe(true)
  })

  it('gt should return false if value is not greater than expected', () => {
    expect(whereFilters.gt('5', 10)).toBe(false)
  })

  it('gte should return true if value is greater than or equal to expected', () => {
    expect(whereFilters.gte('10', 10)).toBe(true)
  })

  it('gte should return false if value is less than expected', () => {
    expect(whereFilters.gte('5', 10)).toBe(false)
  })

  it('contains should return true if expected contains value', () => {
    expect(whereFilters.contains('test', 'this is a test')).toBe(true)
  })

  it('contains should return false if expected does not contain value', () => {
    expect(whereFilters.contains('test', 'this is a demo')).toBe(false)
  })

  it('search should return true if expected matches value regex', () => {
    expect(whereFilters.search('test', 'ts is a Test')).toBe(true)
  })

  it('search should return false if expected does not match value regex', () => {
    expect(whereFilters.search('test', 'this is a demo')).toBe(false)
  })

  it('startsWith should return true if expected starts with value', () => {
    expect(whereFilters.startsWith('test', 'test this')).toBe(true)
  })

  it('startsWith should return false if expected does not start with value', () => {
    expect(whereFilters.startsWith('test', 'this is a test')).toBe(false)
  })

  it('endsWith should return true if expected ends with value', () => {
    expect(whereFilters.endsWith('test', 'this is a test')).toBe(true)
  })

  it('endsWith should return false if expected does not end with value', () => {
    expect(whereFilters.endsWith('test', 'test this')).toBe(false)
  })
})
