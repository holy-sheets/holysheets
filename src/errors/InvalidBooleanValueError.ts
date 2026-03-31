import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class InvalidBooleanValueError extends HolySheetsError {
  constructor(key: string, value: string) {
    super(
      `The value "${value}" for the field "${key}" is not a valid boolean value.`,
      ErrorCodes.INVALID_BOOLEAN_VALUE
    )
    this.name = 'InvalidBooleanValueError'
  }
}
