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
      data: [{ Name: 'Alice', Age: '30' }]
    })
    console.log('Data successfully inserted using OAuth.')
    await table.insert({
      data: [{ Name: 'Bob', Age: '25' }]
    })
    console.log('Data successfully inserted using OAuth.')
    await table.insert({
      data: [{ Name: 'Alice', Age: '35' }]
    })
    console.log('Data successfully inserted using OAuth.')
    // // Fetch data
    const record = await table.findFirst({
      where: { Name: 'Alice' }
    })
    console.log('Record found:', record)

    // Update data
    await table.updateFirst({
      where: { Name: 'Alice' },
      data: { Age: '31' }
    })
    console.log('Data successfully updated using OAuth.')

    // Update multiple records
    await table.updateMany({
      where: { Name: 'Alice' },
      data: { Age: '32' }
    })
    console.log('Data successfully updated using OAuth.')

    // Delete data
    await table.deleteFirst({ where: { Name: 'Bob' } })
    console.log('Data successfully deleted using OAuth.')

    // Delete multiple records
    await table.deleteMany({ where: { Name: 'Alice' } })
    console.log('Data successfully deleted using OAuth.')
  } catch (error) {
    console.error('Error:', error)
  }
}

testOAuth()
