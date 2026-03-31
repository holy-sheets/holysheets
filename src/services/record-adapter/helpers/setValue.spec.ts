import { describe, it, expect } from 'vitest'
import { setValue } from './setValue'
import { FieldRequiredNoDefaultError } from '@/errors/FieldRequiredNoDefaultError'
import { NullableError } from '@/errors/NullableError'
import { NullableRequiredError } from '@/errors/NullableRequiredError'

function callSetValue<T>(params: {
  value?: T | null
  nullable: boolean
  required: boolean
  defaultValue?: T
}): T | null {
  return setValue(params)
}

describe('setValue', () => {
  it('throws NullableRequiredError if nullable and required are both true', () => {
    expect(() =>
      callSetValue({
        value: 'someValue',
        nullable: true,
        required: true
      })
    ).toThrowError(NullableRequiredError)
  })

  it('returns the provided value if it is not undefined', () => {
    const result = callSetValue({
      value: 'Hello',
      nullable: false,
      required: false
    })
    expect(result).toBe('Hello')
  })

  it('throws NullableError if value is null, empty string, or undefined but not nullable', () => {
    // Null scenario
    expect(() =>
      callSetValue({
        value: null,
        nullable: false,
        required: false
      })
    ).toThrowError(NullableError)

    // Empty string scenario
    expect(() =>
      callSetValue({
        value: '',
        nullable: false,
        required: false
      })
    ).toThrowError(NullableError)

    // If providedValue is undefined, we don’t throw here;
    // that scenario is handled by subsequent checks.
    expect(() =>
      callSetValue({
        value: undefined,
        nullable: false,
        required: false
      })
    ).not.toThrow()
  })

  it('returns the defaultValue if defined, otherwise null, when nullable is true and no value provided', () => {
    const withDefault = callSetValue({
      value: undefined,
      nullable: true,
      required: false,
      defaultValue: 'defaultString'
    })
    expect(withDefault).toBe('defaultString')

    const noDefault = callSetValue({
      value: undefined,
      nullable: true,
      required: false
    })
    expect(noDefault).toBeNull()
  })

  it('returns defaultValue if not nullable and defaultValue is defined', () => {
    const result = callSetValue({
      value: undefined,
      nullable: false,
      required: false,
      defaultValue: 'defaultVal'
    })
    expect(result).toBe('defaultVal')
  })

  it('throws FieldRequiredNoDefaultError if not nullable, required, and no defaultValue is provided', () => {
    expect(() =>
      callSetValue({
        value: undefined,
        nullable: false,
        required: true
      })
    ).toThrowError(FieldRequiredNoDefaultError)
  })

  it('returns null if none of the above conditions match', () => {
    // Not nullable, not required, no default, and no value => returns null
    const result = callSetValue({
      value: undefined,
      nullable: false,
      required: false
    })
    expect(result).toBeNull()
  })
})
