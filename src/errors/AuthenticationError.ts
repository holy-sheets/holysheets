import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'

export class AuthenticationError extends HolySheetsError {
  constructor() {
    super(
      'Authentication failed. Please ensure the credentials are correct and the sheet is shared with the JWT credentials email.',
      ErrorCodes.AUTHENTICATION_ERROR
    )
    this.name = 'AuthenticationError'
  }
}
