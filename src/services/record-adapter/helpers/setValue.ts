import { FieldRequiredNoDefaultError } from '@/errors/FieldRequiredNoDefaultError'
import { NullableError } from '@/errors/NullableError'
import { NullableRequiredError } from '@/errors/NullableRequiredError'

function isNullish(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

type SetValueParams<T> = {
  value?: T | null | undefined
  nullable: boolean
  required: boolean
  defaultValue?: T
}

export function setValue<T>({
  value,
  nullable,
  required,
  defaultValue
}: SetValueParams<T>): T | null {
  if (nullable && required) {
    throw new NullableRequiredError()
  }

  if (value !== undefined) {
    if (isNullish(value) && !nullable) {
      throw new NullableError()
    }
    console.log('>>> 1', { value })
    return value
  }

  if (nullable) {
    console.log('>>> 2', { value })
    return defaultValue !== undefined ? defaultValue : null
  }

  if (!nullable && defaultValue !== undefined) {
    console.log('>>> 3', { value })
    return defaultValue
  }

  if (!nullable && required) {
    throw new FieldRequiredNoDefaultError()
  }

  return null
}
