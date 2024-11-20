import { describe, it, expect } from 'vitest'
import { alphabet, indexToColumn } from '@/utils/columnUtils'

describe('alphabet', () => {
  it('should contain 52 elements', () => {
    expect(alphabet).toHaveLength(52)
  })

  it('should start with A and end with AZ', () => {
    expect(alphabet[0]).toBe('A')
    expect(alphabet[alphabet.length - 1]).toBe('AZ')
  })

  it('should contain the correct labels for the first 26 letters', () => {
    const expectedFirst26 = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
    expect(alphabet.slice(0, 26)).toEqual(expectedFirst26)
  })

  it('should contain the correct labels for the next 26 letters', () => {
    const expectedNext26 = [
      'AA',
      'AB',
      'AC',
      'AD',
      'AE',
      'AF',
      'AG',
      'AH',
      'AI',
      'AJ',
      'AK',
      'AL',
      'AM',
      'AN',
      'AO',
      'AP',
      'AQ',
      'AR',
      'AS',
      'AT',
      'AU',
      'AV',
      'AW',
      'AX',
      'AY',
      'AZ'
    ]
    expect(alphabet.slice(26)).toEqual(expectedNext26)
  })
})

describe('indexToColumn', () => {
  it('should return the correct column label for a given index', () => {
    expect(indexToColumn(0)).toBe('A')
    expect(indexToColumn(25)).toBe('Z')
    expect(indexToColumn(26)).toBe('AA')
    expect(indexToColumn(51)).toBe('AZ')
  })

  it('should return undefined for out-of-range indices', () => {
    expect(indexToColumn(-1)).toBeUndefined()
    expect(indexToColumn(52)).toBeUndefined()
  })
})
