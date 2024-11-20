import { describe, it, expect } from 'vitest'
import { whereFilters } from './whereFilters'

describe('whereFilters', () => {
  it('should match using equals filter', () => {
    const filter = whereFilters.equals('test')
    expect(filter('test')).toBe(true)
    expect(filter('different')).toBe(false)
  })

  it('should match using not filter', () => {
    const filter = whereFilters.not('test')
    expect(filter('test')).toBe(false)
    expect(filter('different')).toBe(true)
  })

  it('should match using in filter', () => {
    const filter = whereFilters.in(['apple', 'banana'])
    expect(filter('apple')).toBe(true)
    expect(filter('orange')).toBe(false)
  })

  it('should match using notIn filter', () => {
    const filter = whereFilters.notIn(['apple', 'banana'])
    expect(filter('apple')).toBe(false)
    expect(filter('orange')).toBe(true)
  })

  it('should match using lt filter', () => {
    const filter = whereFilters.lt(10)
    expect(filter('5')).toBe(true)
    expect(filter('15')).toBe(false)
  })

  it('should match using lte filter', () => {
    const filter = whereFilters.lte(10)
    expect(filter('10')).toBe(true)
    expect(filter('15')).toBe(false)
  })

  it('should match using gt filter', () => {
    const filter = whereFilters.gt(10)
    expect(filter('15')).toBe(true)
    expect(filter('5')).toBe(false)
  })

  it('should match using gte filter', () => {
    const filter = whereFilters.gte(10)
    expect(filter('10')).toBe(true)
    expect(filter('5')).toBe(false)
  })

  it('should match using contains filter', () => {
    const filter = whereFilters.contains('test')
    expect(filter('this is a test')).toBe(true)
    expect(filter('no match')).toBe(false)
  })

  it('should match using search filter', () => {
    const filter = whereFilters.search('test')
    expect(filter('this is a test')).toBe(true)
    expect(filter('no match')).toBe(false)
  })

  it('should match using startsWith filter', () => {
    const filter = whereFilters.startsWith('start')
    expect(filter('start of the string')).toBe(true)
    expect(filter('no match')).toBe(false)
  })

  it('should match using endsWith filter', () => {
    const filter = whereFilters.endsWith('end')
    expect(filter('this is the end')).toBe(true)
    expect(filter('no match')).toBe(false)
  })
})
