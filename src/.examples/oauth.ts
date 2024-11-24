import { google } from 'googleapis'
import HolySheets from '@/index'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Retrieve necessary environment variables
const spreadsheetId = process.env.SPREADSHEET_ID as string
const clientId = process.env.OAUTH_CLIENT_ID as string
const clientSecret = process.env.OAUTH_CLIENT_SECRET as string
const redirectUri = process.env.OAUTH_REDIRECT_URI as string
const refreshToken = process.env.OAUTH_REFRESH_TOKEN as string

/**
 * Initializes the HolySheets instance with OAuth2 authentication.
 *
 * @returns An instance of HolySheets configured with OAuth2 authentication.
 */
async function initializeHolySheets(): Promise<
  HolySheets<{ Name: string; Age: string }>
> {
  // Validate environment variables
  if (!spreadsheetId) {
    throw new Error(
      'SPREADSHEET_ID is not defined in the environment variables.'
    )
  }
  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw new Error('One or more OAuth2 environment variables are missing.')
  }

  // Initialize OAuth2 client
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  auth.setCredentials({ refresh_token: refreshToken })

  // Create an instance of HolySheets
  const sheets = new HolySheets({
    spreadsheetId,
    auth
  })

  // Define the table (sheet) to operate on
  const table = sheets.base<{ Name: string; Age: string }>('holysheets')

  return table
}

/**
 * Inserts multiple records into the spreadsheet.
 *
 * @param table - The HolySheets table instance.
 */
async function insertRecords(table: HolySheets<{ Name: string; Age: string }>) {
  const recordsToInsert = [
    { Name: 'Alice', Age: '30' },
    { Name: 'Bob', Age: '25' },
    { Name: 'Charlie', Age: '35' }
  ]

  try {
    await table.insert({ data: recordsToInsert })
    console.log('✅ Successfully inserted records:')
    recordsToInsert.forEach(record =>
      console.log(`   - ${record.Name}, Age: ${record.Age}`)
    )
  } catch (error) {
    console.error('❌ Error inserting records:', error)
  }
}

/**
 * Fetches the first record matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function fetchFirstRecord(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Alice' }

  try {
    const record = await table.findFirst({ where: criteria })
    if (record) {
      console.log('✅ Found first matching record:', record.fields)
    } else {
      console.log('ℹ️ No matching record found for criteria:', criteria)
    }
  } catch (error) {
    console.error('❌ Error fetching first record:', error)
  }
}

/**
 * Fetches all records matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function fetchMultipleRecords(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Alice' }

  try {
    const records = await table.findMany({ where: criteria })
    if (records.length > 0) {
      console.log(`✅ Found ${records.length} matching record(s):`)
      records.forEach(record => console.log(`   - Row:`, record.fields))
    } else {
      console.log('ℹ️ No matching records found for criteria:', criteria)
    }
  } catch (error) {
    console.error('❌ Error fetching multiple records:', error)
  }
}

/**
 * Updates the first record matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function updateFirstRecord(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Alice' }
  const updatedData = { Age: '31' }

  try {
    await table.updateFirst({ where: criteria, data: updatedData })
    console.log(
      '✅ Successfully updated the first matching record:',
      updatedData
    )
  } catch (error) {
    console.error('❌ Error updating first record:', error)
  }
}

/**
 * Updates all records matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function updateMultipleRecords(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Alice' }
  const updatedData = { Age: '32' }

  try {
    await table.updateMany({ where: criteria, data: updatedData })
    console.log('✅ Successfully updated all matching records:', updatedData)
  } catch (error) {
    console.error('❌ Error updating multiple records:', error)
  }
}

/**
 * Deletes the first record matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function deleteFirstRecord(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Bob' }

  try {
    await table.deleteFirst({ where: criteria })
    console.log(
      '✅ Successfully deleted the first matching record for:',
      criteria
    )
  } catch (error) {
    console.error('❌ Error deleting first record:', error)
  }
}

/**
 * Deletes all records matching the specified criteria.
 *
 * @param table - The HolySheets table instance.
 */
async function deleteMultipleRecords(
  table: HolySheets<{ Name: string; Age: string }>
) {
  const criteria = { Name: 'Alice' }

  try {
    await table.deleteMany({ where: criteria })
    console.log('✅ Successfully deleted all matching records for:', criteria)
  } catch (error) {
    console.error('❌ Error deleting multiple records:', error)
  }
}

/**
 * Main function to execute all operations sequentially.
 */
async function executeAllOperations() {
  try {
    const table = await initializeHolySheets()
    console.log(
      '📄 Initialized HolySheets instance with OAuth2 authentication.\n'
    )

    // 1. Insert Records
    await insertRecords(table)

    // 2. Fetch First Matching Record
    await fetchFirstRecord(table)

    // 3. Fetch Multiple Matching Records
    await fetchMultipleRecords(table)

    // 4. Update First Matching Record
    await updateFirstRecord(table)

    // 5. Update Multiple Matching Records
    await updateMultipleRecords(table)

    // 6. Delete First Matching Record
    await deleteFirstRecord(table)

    // 7. Delete Multiple Matching Records
    await deleteMultipleRecords(table)

    console.log('🎉 All HolySheets operations completed successfully.')
  } catch (error) {
    console.error('❌ An unexpected error occurred during operations:', error)
  }
}

// Execute the operations
executeAllOperations()
