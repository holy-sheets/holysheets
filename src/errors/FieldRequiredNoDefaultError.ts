import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class FieldRequiredNoDefaultError extends HolySheetsError {
  constructor() {
    super(
      'A required field cannot be left empty without a default value.',
      ErrorCodes.FIELD_REQUIRED_NO_DEFAULT
    )
    this.name = 'FieldRequiredNoDefaultError'
  }
}
