import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSingleColumnNotation, getSingleRowNotation } from './notation'

describe('notation', () => {
  it('should getSingleRowNotation corectly', () => {
    const sheetName = 'example'
    const rowNumber = 1
    expect(getSingleRowNotation(sheetName, rowNumber)).toBe('example!1:1')
  })

  it('should getSingleColumnNotation correctly', () => {
    const sheetName = 'other-example'
    const columnIndex = 0
    expect(getSingleColumnNotation(sheetName, columnIndex)).toBe(
      'other-example!A2:A'
    )
    const biggerColumnIndex = 28
    expect(getSingleColumnNotation(sheetName, biggerColumnIndex)).toBe(
      'other-example!AC2:AC'
    )
  })
})
