import { HolySheetsCredentials } from '@/types/credentials'
import { insert } from '@/core/insert/insert'
import { findFirst } from '@/core/findFirst/findFirst'
import { findMany } from '@/core/findMany/findMany'
import { findAll } from '@/core/findAll/findAll'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { updateMany } from '@/core/updateMany/updateMany'
import { clearFirst } from '@/core/clearFirst/clearFirst'
import { clearMany } from '@/core/clearMany/clearMany'
import { getSheetId } from '@/core/getSheetId/getSheetId'
import { deleteFirst } from '@/core/deleteFirst/deleteFirst'
import { deleteMany } from '@/core/deleteMany/deleteMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { GoogleSheetsService } from '@/services/google-sheets/GoogleSheetsService'
import {
  BatchOperationResult,
  OperationResult
} from '@/services/metadata/IMetadataService'
import { OperationConfigs } from '@/types/operationConfigs'
import {
  sanitizeBatchOperationResult,
  sanitizeOperationResult
} from '@/utils/sanitizeResult/sanitizeResult'
import {
  BaseOperationOptions,
  FindAllOptions,
  FindOperationOptions,
  UpdateOptions
} from '@/types/operationOptions'

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

  public async insert(
    options: {
      data: RecordType[]
    },
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType[]>> {
    const result = await insert<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeOperationResult(result)
  }

  public async findFirst(
    options: FindOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    const result = await findFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeOperationResult(result)
  }

  public async findMany(
    options: FindOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    const result = await findMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeBatchOperationResult(result)
  }

  public async findAll(
    options: FindAllOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    const result = await findAll<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeBatchOperationResult(result)
  }

  public async updateFirst(
    options: UpdateOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    const result = await updateFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeOperationResult(result)
  }

  public async updateMany(
    options: UpdateOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    const result = await updateMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeBatchOperationResult(result)
  }

  public async clearFirst(
    options: BaseOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    const result = await clearFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeOperationResult(result)
  }

  public async clearMany(
    options: BaseOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    const result = await clearMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeBatchOperationResult(result)
  }

  public async deleteFirst(
    options: BaseOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<OperationResult<RecordType>> {
    const result = await deleteFirst<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeOperationResult(result)
  }

  public async deleteMany(
    options: BaseOperationOptions<RecordType>,
    configs?: OperationConfigs
  ): Promise<BatchOperationResult<RecordType>> {
    const result = await deleteMany<RecordType>(
      {
        spreadsheetId: this.spreadsheetId,
        sheets: this.sheets,
        sheet: this.sheet
      },
      options,
      configs
    )
    return sanitizeBatchOperationResult(result)
  }
}
