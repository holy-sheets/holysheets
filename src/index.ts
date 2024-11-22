import { sheets_v4, Auth, google } from 'googleapis'
import { HolySheetsCredentials } from '@/types/credentials'
import { insert } from '@/core/insert'
import { findFirst } from '@/core/findFirst/findFirst'
import { findMany } from '@/core/findMany'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { updateMany } from '@/core/updateMany/updateMany'
import { clearFirst } from '@/core/clearFirst'
import { clearMany } from '@/core/clearMany'
import { getSheetId } from '@/core/getSheetId'
import { deleteFirst } from '@/core/deleteFirst'
import { deleteMany } from '@/core/deleteMany'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'

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

  public async insert(options: { data: RecordType[] }) {
    await insert<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async findFirst(options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }) {
    return await findFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async findMany(options: {
    where: WhereClause<RecordType>
    select?: SelectClause<RecordType>
  }) {
    return await findMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async updateFirst(options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }): Promise<RecordType> {
    return await updateFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async updateMany(options: {
    where: WhereClause<RecordType>
    data: Partial<RecordType>
  }): Promise<RecordType[]> {
    return await updateMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async clearFirst(options: { where: WhereClause<RecordType> }) {
    return await clearFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async clearMany(options: { where: WhereClause<RecordType> }) {
    return await clearMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async getSheetId(title: string) {
    return await getSheetId({
      spreadsheetId: this.spreadsheetId,
      sheets: this.sheets,
      title
    })
  }

  public async deleteFirst(options: { where: WhereClause<RecordType> }) {
    return await deleteFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }

  public async deleteMany(options: { where: WhereClause<RecordType> }) {
    return await deleteMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options
    )
  }
}
