import { google } from 'googleapis'
import HolySheets from '@/index'
import dotenv from 'dotenv'

dotenv.config()

const spreadsheetId = process.env.SPREADSHEET_ID as string
const serviceAccountCredentials = JSON.parse(
  process.env.SERVICE_ACCOUNT_CREDENTIALS as string
)

async function testJWT() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

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
    console.log('Data successfully inserted using JWT.')

    // Fetch data
    const record = await table.findFirst({
      where: { Name: 'Alice' }
    })
    console.log('Record found:', record)
  } catch (error) {
    console.error('Error:', error)
  }
}

testJWT()
