import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class NullableRequiredError extends HolySheetsError {
  constructor() {
    super(
      'Error: Invalid configuration: a field cannot be both nullable and required.',
      ErrorCodes.NULLABLE_REQUIRED_CONFLICT
    )
    this.name = 'NullableRequiredError'
  }
}
