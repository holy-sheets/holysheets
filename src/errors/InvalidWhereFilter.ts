import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class InvalidWhereFilterError extends HolySheetsError {
  constructor(whereFilter: string) {
    super(
      `The where filter "${whereFilter}" is invalid.`,
      ErrorCodes.INVALID_WHERE_FILTER
    )
    this.name = 'InvalidWhereFilter'
  }
}
