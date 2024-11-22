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
    await table.insert({
      data: [{ Name: 'Bob', Age: '25' }]
    })
    console.log('Data successfully inserted using JWT.')
    await table.insert({
      data: [{ Name: 'Alice', Age: '35' }]
    })
    console.log('Data successfully inserted using JWT.')
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
    console.log('Data successfully updated using JWT.')

    // Update multiple records
    await table.updateMany({
      where: { Name: 'Alice' },
      data: { Age: '32' }
    })
    console.log('Data successfully updated using JWT.')

    // Delete data
    await table.deleteFirst({ where: { Name: 'Bob' } })
    console.log('Data successfully deleted using JWT.')

    // Delete multiple records
    await table.deleteMany({ where: { Name: 'Alice' } })
    console.log('Data successfully deleted using JWT.')
  } catch (error) {
    console.error('Error:', error)
  }
}

testJWT()
