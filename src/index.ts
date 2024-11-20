import { sheets_v4, Auth, google } from 'googleapis'
import { HolySheetsCredentials } from '@/types/credentials'
import { alphabet, indexToColumn } from '@/utils/columnUtils'
import { combine, decombine } from '@/utils/dataUtils'
import { getHeaders } from '@/utils/headers'
import { write } from '@/utils/write'
import { checkWhereFilter } from '@/utils/where'
import { WhereClause, WhereCondition } from '@/types/where'
import { SelectClause } from '@/types/select'

interface SheetRecord<RecordType extends Record<string, string>> {
  range: string
  row: number
  fields: Partial<RecordType>
}

/**
 * Represents a wrapper class for interacting with Google Sheets using the Google Sheets API.
 * @typeparam RecordType - The type of the records in the table.
 */
export default class HolySheets<RecordType extends Record<string, any> = any> {
  public sheets: sheets_v4.Sheets
  public sheet: string = ''
  public spreadsheetId: string = ''
  private readonly auth:
    | Auth.GoogleAuth
    | Auth.OAuth2Client
    | Auth.JWT
    | Auth.Compute

  constructor(credentials: HolySheetsCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
    this.auth = credentials.auth
    this.sheets = google.sheets({ version: 'v4', auth: credentials.auth })
  }

  /**
   * Creates a new instance of HolySheets with the specified table.
   * @param table - The name of the table to use.
   * @returns A new instance of HolySheets with the specified table.
   * @typeparam T - The type of the records in the table.
   */
  public base<T extends Record<string, any>>(table: string): HolySheets<T> {
    const instance = new HolySheets<T>({
      spreadsheetId: this.spreadsheetId,
      auth: this.auth
    })
    instance.setTable(table)
    return instance
  }

  private setTable(table: string) {
    this.sheet = table
  }

  /**
   * Inserts data into the spreadsheet.
   * @param options - The options for inserting data.
   * @param options.data - The data to be inserted.
   * @returns A Promise that resolves when the data is successfully inserted.
   * @throws An error if no data is found in the sheet.
   */
  public async insert(options: { data: RecordType[] }) {
    const { data } = options
    const sheet = this.sheet
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!${alphabet[0]}:${alphabet[alphabet.length - 1]}`
    })

    if (!response.data.values) {
      throw new Error('No data found in the sheet.')
    }
    const lastLine = response.data.values.length
    const headers = await getHeaders({
      sheet: sheet,
      sheets: this.sheets,
      spreadsheetId: this.spreadsheetId
    })
    const valuesFromRecords = data.map(record => decombine(record, headers))
    const range = `A${lastLine + 1}:${indexToColumn(headers.length - 1)}${lastLine + valuesFromRecords.length}`
    await write({
      tableName: sheet,
      range,
      values: valuesFromRecords,
      spreadsheetId: this.spreadsheetId,
      sheets: this.sheets
    })
  }

  /**
   * Finds the first row in the spreadsheet that matches the specified conditions.
   *
   * @param options - The options for finding the row.
   * @param options.where - The conditions to filter the rows.
   * @param options.select - The columns to select from the row.
   *
   * @returns A promise that resolves to a `RowSet` object representing the first matching row, or `undefined` if no match is found.
   */
  public async findFirst(options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }): Promise<SheetRecord<RecordType> | undefined> {
    const { where } = options
    const sheet = this.sheet
    const headers = await getHeaders({
      sheet,
      sheets: this.sheets,
      spreadsheetId: this.spreadsheetId
    })
    const columns = Object.keys(where) as (keyof RecordType)[]
    const header = headers.find(header => header.name === columns[0])
    const range = `${sheet}!${header?.column}:${header?.column}`
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      })
      const rowIndex = response.data.values?.findIndex(row =>
        checkWhereFilter(where[columns[0]] as WhereCondition | string, row[0])
      )
      if (rowIndex === -1 || !rowIndex) {
        return undefined
      }
      const rowRange = `${sheet}!A${rowIndex + 1}:${indexToColumn(headers.length - 1)}${rowIndex + 1}`
      const rowResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: rowRange
      })

      if (!rowResponse.data.values) {
        return undefined
      }
      const selectedHeaders = headers.filter(header =>
        options.select ? options.select[header.name] : true
      )
      const fields = combine<RecordType>(
        rowResponse.data.values[0],
        selectedHeaders
      )
      return {
        range: rowRange,
        row: rowIndex + 1,
        fields
      }
    } catch (error) {
      console.error('Error finding data' + error) // eslint-disable-line
    }
  }

  /**
   * Retrieves multiple rows from the spreadsheet based on the provided options.
   * @param options - The options for the query, including the `where` clause and optional `select` clause.
   * @returns A promise that resolves to an array of row sets matching the query.
   */
  public async findMany(options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }): Promise<SheetRecord<RecordType>[]> {
    const { where, select } = options
    const sheet = this.sheet
    const headers = await getHeaders({
      sheet,
      sheets: this.sheets,
      spreadsheetId: this.spreadsheetId
    })
    const columns = Object.keys(where)
    const header = headers.find(header => header.name === columns[0])
    const range = `${sheet}!${header?.column}:${header?.column}`

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      })
      const rowIndexes = response.data.values?.reduce(
        (acc: number[], row, index) => {
          if (checkWhereFilter(where[columns[0]] as WhereCondition, row[0])) {
            acc.push(index)
          }
          return acc
        },
        []
      )
      if (!rowIndexes || rowIndexes.length === 0) {
        return []
      }
      const rowsRange = rowIndexes.map(
        index =>
          `${sheet}!A${index + 1}:${indexToColumn(headers.length - 1)}${index + 1}`
      )
      const ranges = rowsRange
      const batchGetResponse = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges: ranges
      })

      if (!batchGetResponse.data.valueRanges) {
        return []
      }
      const rowsResponse = batchGetResponse.data.valueRanges.map(
        (valueRange, index) => {
          return {
            range: ranges[index],
            values: valueRange.values,
            row: rowIndexes[index] + 1
          }
        }
      )

      return rowsResponse.map(({ range, values, row }) => {
        const selectedHeaders = headers.filter(header =>
          select ? select[header.name] : true
        )
        const fields = combine<RecordType>(
          values ? values[0] : [],
          selectedHeaders
        )
        return { range, row, fields }
      })
    } catch (error) {
      console.error('Error finding data' + error) // eslint-disable-line
      return []
    }
  }

  /**
   * Updates the first record that matches the specified conditions with the provided data.
   * Throws an error if no record is found to update.
   *
   * @param options - The options for the update operation.
   * @param options.where - The conditions to match the record.
   * @param options.data - The data to update the record with.
   * @returns A promise that resolves to void.
   */
  public async updateFirst(options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }): Promise<void> {
    const { where, data } = options

    const record = await this.findFirst({ where })

    if (!record) {
      throw new Error('No record found to update')
    }

    const { fields } = record
    const updatedFields = { ...fields, ...data } as RecordType
    return await this.insert({ data: [updatedFields] })
  }

  /**
   * Updates multiple records that match the specified conditions.
   *
   * @param options - The options for the update operation.
   * @param options.where - The conditions that the records must match.
   * @param options.data - The partial data to update the matching records with.
   * @returns A promise that resolves to void when the update operation is complete.
   * @throws An error if no records are found to update.
   */
  public async updateMany(options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }): Promise<void> {
    const { where, data } = options
    const records = await this.findMany({ where })

    if (records.length === 0) {
      throw new Error('No records found to update')
    }
    const updatedRecords = records.map(record => {
      const { fields } = record
      const updatedFields = { ...fields, ...data } as RecordType
      return updatedFields
    })

    return await this.insert({ data: updatedRecords })
  }

  /**
   * Clears the first record that matches the specified condition.
   *
   * @param options - The options for clearing the record.
   * @param options.where - The condition to match the record.
   * @returns A promise that resolves when the record is cleared.
   * @throws An error if no record is found to delete.
   */
  public async clearFirst(options: {
    where: WhereClause<RecordType>
  }): Promise<SheetRecord<RecordType>> {
    const { where } = options
    const record = await this.findFirst({ where })
    if (!record) {
      throw new Error('No record found to delete')
    }
    const { range } = record
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range
    })
    return record
  }

  /**
   * Clear multiple records from the spreadsheet based on the provided conditions.
   * Throws an error if no records are found to delete.
   * @param options - The options for the clear operation.
   * @param options.where - The conditions to filter the records to be cleared.
   * @returns A Promise that resolves when the clear operation is complete.
   * @throws An error if no records are found to delete.
   */
  public async clearMany(options: {
    where: WhereClause<RecordType>
  }): Promise<SheetRecord<RecordType>[]> {
    const { where } = options
    const records = await this.findMany({ where })
    if (records.length === 0) {
      throw new Error('No records found to delete')
    }
    const ranges = records.map(record => record.range)
    await this.sheets.spreadsheets.values.batchClear({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        ranges
      }
    })
    return records
  }

  /**
   * Gets the ID of a sheet from its title.
   *
   * @param title The title of the sheet.
   * @returns A promise that resolves to the ID of the sheet.
   */
  public async getSheetId(title: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      includeGridData: false
    })

    const sheet = response.data.sheets?.find(
      sheet => sheet.properties?.title === title
    )

    if (!sheet) {
      throw new Error(`No sheet found with title: ${title}`)
    }
    if (!sheet.properties?.sheetId) {
      throw new Error(`No sheet ID found for sheet with title: ${title}`)
    }
    return sheet.properties?.sheetId
  }

  /**
   * Deletes the first record that matches the specified condition.
   *
   * @param options - The options for deleting the record.
   * @param options.where - The condition to match the record.
   * @returns A promise that resolves when the record is deleted.
   * @throws An error if no record is found to delete.
   */
  public async deleteFirst(options: {
    where: WhereClause<RecordType>
  }): Promise<SheetRecord<RecordType>> {
    const { where } = options
    const sheetId = await this.getSheetId(this.sheet)
    const record = await this.findFirst({ where })
    if (!record) {
      throw new Error('No record found to delete')
    }
    const requests = [
      {
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: record?.row - 1,
            endIndex: record?.row
          }
        }
      }
    ]
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests
      }
    })
    return record as SheetRecord<RecordType>
  }

  /**
   * Deletes multiple records from the spreadsheet based on the provided conditions.
   * Throws an error if no records are found to delete.
   * @param options - The options for the delete operation.
   * @param options.where - The conditions to filter the records to be deleted.
   * @returns A Promise that resolves when the delete operation is complete.
   * @throws An error if no records are found to delete.
   */
  public async deleteMany(options: {
    where: WhereClause<RecordType>
  }): Promise<SheetRecord<RecordType>[]> {
    const { where } = options
    const records = await this.findMany({ where })
    if (records.length === 0) {
      throw new Error('No records found to delete')
    }
    const sheetId = await this.getSheetId(this.sheet)
    const requests = records
      .sort((a, b) => b.row - a.row)
      .map(record => ({
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: record.row - 1,
            endIndex: record.row
          }
        }
      }))

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests
      }
    })
    return records
  }
}
