import { google } from 'googleapis'
import HolySheets from '../index'
import dotenv from 'dotenv'

dotenv.config()

const spreadsheetId = process.env.SPREADSHEET_ID as string
const clientId = process.env.OAUTH_CLIENT_ID as string
const clientSecret = process.env.OAUTH_CLIENT_SECRET as string
const redirectUri = process.env.OAUTH_REDIRECT_URI as string
const refreshToken = process.env.OAUTH_REFRESH_TOKEN as string

async function testOAuth() {
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  auth.setCredentials({ refresh_token: refreshToken })

  const sheets = new HolySheets({
    spreadsheetId,
    auth
  })

  const table = sheets.base<{ Name: string; Age: string }>('holysheets')

  try {
    // Insert data
    await table.insert({
      data: [{ Name: 'Bob', Age: '25' }]
    })
    console.log('Data successfully inserted using OAuth.')

    // Fetch data
    const record = await table.findFirst({
      where: { Name: 'Bob' }
    })
    console.log('Record found:', record)
  } catch (error) {
    console.error('Error:', error)
  }
}

testOAuth()
