import { Auth } from 'googleapis'

/**
 * @typedef AuthClient
 * @type {Auth.GoogleAuth | Auth.OAuth2Client | Auth.JWT | Auth.Compute}
 */
export type AuthClient =
  | Auth.GoogleAuth
  | Auth.OAuth2Client
  | Auth.JWT
  | Auth.Compute

/**
 * @typedef HolySheetsCredentials
 * @property {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @property {AuthClient} auth - The authentication client used to access the Google Spreadsheet.
 */
export interface HolySheetsCredentials {
  spreadsheetId: string
  auth: AuthClient
}
