import { describe, it, expect } from 'vitest'
import { pickKeysFromObject, omitKeysFromObject } from './objectKeys'

describe('pickKeysFromObject', () => {
  it('should pick specified keys from the object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys: Array<keyof typeof obj> = ['a', 'c']
    const result = pickKeysFromObject(obj, keys)
    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('should return an empty object if no keys match', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys: Array<keyof typeof obj> = ['d', 'e']
    const result = pickKeysFromObject(obj, keys)
    expect(result).toEqual({})
  })
})

describe('omitKeysFromObject', () => {
  it('should omit specified keys from the object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys: Array<keyof typeof obj> = ['a', 'c']
    const result = omitKeysFromObject(obj, keys)
    expect(result).toEqual({ b: 2 })
  })

  it('should return the same object if no keys match', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys: Array<keyof typeof obj> = ['d', 'e']
    const result = omitKeysFromObject(obj, keys)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })
})
