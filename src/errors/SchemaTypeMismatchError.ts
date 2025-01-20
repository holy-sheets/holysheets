import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class SchemaTypeMismatchError extends HolySheetsError {
  constructor(key: string, value: string, type: string) {
    super(
      `The value "${value}" for key "${key}" does not match the expected type "${type}".`,
      ErrorCodes.SCHEMA_TYPE_MISMATCH
    )
    this.name = 'SchemaTypeMismatchError'
  }
}
