import { HolySheetsCredentials } from '@/types/credentials'
import { insert } from '@/core/insert/insert'
import { findFirst } from '@/core/findFirst/findFirst'
import { findMany } from '@/core/findMany/findMany'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { updateMany } from '@/core/updateMany/updateMany'
import { clearFirst } from '@/core/clearFirst/clearFirst'
import { clearMany } from '@/core/clearMany/clearMany'
import { getSheetId } from '@/core/getSheetId/getSheetId'
import { deleteFirst } from '@/core/deleteFirst/deleteFirst'
import { deleteMany } from '@/core/deleteMany/deleteMany'
import { WhereClause } from '@/types/where'
import { SelectClause } from '@/types/select'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { GoogleSheetsService } from '@/services/google-sheets/GoogleSheetsService'
import {
  BatchOperationResult,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { OperationConfigs } from '@/types/operationConfigs'

export default class HolySheets<RecordType extends Record<string, any> = any> {
  public sheets: IGoogleSheetsService
  public sheet: string = ''
  public spreadsheetId: string = ''

  constructor(credentials: HolySheetsCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets = new GoogleSheetsService(credentials)
  }

  public base<T extends Record<string, any>>(table: string): HolySheets<T> {
    const instance = new HolySheets<T>({
      spreadsheetId: this.spreadsheetId,
      auth: (this.sheets as GoogleSheetsService).getAuth()
    })
    instance.setTable(table)
    return instance
  }

  private setTable(table: string) {
    this.sheet = table
  }

  public async insert(
    options: {
      data: RecordType[]
    },
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType[]>> {
    return await insert<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async findFirst(
    options: {
      where: WhereClause<RecordType>
      select?: SelectClause<RecordType>
    },
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    return await findFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async findMany(
    options: {
      where: WhereClause<RecordType>
      select?: SelectClause<RecordType>
    },
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    return await findMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async updateFirst(
    options: {
      where: WhereClause<RecordType>
      data: Partial<RecordType>
    },
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    return await updateFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async updateMany(
    options: {
      where: WhereClause<RecordType>
      data: Partial<RecordType>
    },
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    return await updateMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async clearFirst(
    options: {
      where: WhereClause<RecordType>
    },
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    return await clearFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async clearMany(
    options: { where: WhereClause<RecordType> },
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    return await clearMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async getSheetId(title: string, configs?: OperationConfigs) {
    return await getSheetId(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        title
      },
      configs
    )
  }

  public async deleteFirst(
    options: { where: WhereClause<RecordType> },
    configs?: OperationConfigs
  ) {
    return await deleteFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }

  public async deleteMany(
    options: { where: WhereClause<RecordType> },
    configs?: OperationConfigs
  ) {
    return await deleteMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
  }
}
