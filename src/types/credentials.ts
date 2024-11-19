import { Auth } from 'googleapis'

/**
 * @typedef HolySheetsCredentials
 * @property {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @property {Auth.GoogleAuth | Auth.OAuth2Client | Auth.JWT | Auth.Compute} auth - The authentication client used to access the Google Spreadsheet.
 */
export interface HolySheetsCredentials {
  spreadsheetId: string
  auth: Auth.GoogleAuth | Auth.OAuth2Client | Auth.JWT | Auth.Compute
}
