import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class MultipleRecordsFoundForUniqueError extends HolySheetsError {
  constructor() {
    super(
      'Multiple records found for unique query. Ensure the query is unique.',
      ErrorCodes.MULTIPLE_RECORDS_FOUND_FOR_UNIQUE
    )
    this.name = 'MultipleRecordsFoundForUniqueError'
  }
}
