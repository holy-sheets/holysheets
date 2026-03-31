import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class NullableError extends HolySheetsError {
  constructor() {
    super(
      'Error: Null value provided for a non-nullable field.',
      ErrorCodes.NULL_VALUE_FOR_NON_NULLABLE_FIELD
    )
    this.name = 'NullableError'
  }
}
