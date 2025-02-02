import { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'
import { FindSheetOperation } from '@/base-operation/FindOperation'
import { HeaderService } from '@/services/header/HeaderService'
import { RecordSchema } from '@/types/RecordSchema.types'
import {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'
import { HeaderColumn } from './services/header/HeaderService.types'
import { GoogleSheetsAdapter } from './services/google-sheets/adapter/GoogleSheetsAdapter'
import { SheetsAdapterService } from './types/SheetsAdapterService'
import { MultipleRecordsFoundForUniqueError } from './errors/MultipleRecordsFoundForUniqueError'
import { DataTypes } from './types/RecordSchema.types'
import { ClearSheetOperation } from './operations/ClearOperation'

interface HolySheetsBaseOptions {
  headerRow?: number
}

enum HolySheetsDefaults {
  HEADER_ROW = 1
}

export default class HolySheets<RecordType extends object> {
  public sheets: SheetsAdapterService
  public sheet: string = ''
  public spreadsheetId: string = ''
  private headerRow: number = HolySheetsDefaults.HEADER_ROW
  private schema?: RecordSchema<RecordType>
  private readonly headerService: HeaderService

  constructor(credentials: HolySheetsCredentials) {
    this.spreadsheetId = credentials.spreadsheetId
    this.sheets = new GoogleSheetsAdapter(credentials)
    this.headerService = HeaderService.getInstance(this.sheets)
  }
  public base<RecordType extends object>(
    table: string,
    options: HolySheetsBaseOptions = {}
  ): HolySheets<RecordType> {
    const instance = new HolySheets<RecordType>({
      spreadsheetId: this.spreadsheetId,
      auth: this.sheets.getAuth()
    })
    const { headerRow = HolySheetsDefaults.HEADER_ROW } = options
    instance.setTable(table)
    instance.setHeaderRow(headerRow)
    return instance
  }

  /**
   * Defines the schema for the HolySheets instance.
   *
   * @param schema - The schema to be defined, represented as a `RecordSchema` of `RecordType`.
   * @returns The current instance of `HolySheets` with the defined schema.
   */
  public defineSchema(
    schema: RecordSchema<RecordType>
  ): HolySheets<RecordType> {
    this.schema = schema
    return this
  }

  private setTable(table: string) {
    this.sheet = table
  }

  private setHeaderRow(headerRow: number) {
    this.headerRow = headerRow
  }

  /**
   * Retrieves the headers from the specified spreadsheet and sheet.
   *
   * @returns {Promise<HeaderColumn[]>} A promise that resolves to an array of header columns.
   */
  private async getHeaders(): Promise<HeaderColumn[]> {
    return await this.headerService.getHeaders(
      this.spreadsheetId,
      this.sheet,
      this.headerRow
    )
  }

  private async runClearOperation(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType[]> {
    const headers = await this.getHeaders()
    const clearOperation = new ClearSheetOperation<RecordType>(
      {
        sheet: this.sheet,
        credentials: {
          spreadsheetId: this.spreadsheetId,
          auth: this.sheets.getAuth()
        },
        sheets: this.sheets,
        schema: this.schema,
        headerRow: this.headerRow,
        headers
      },
      options,
      configs
    )
    return clearOperation.executeOperation()
  }

  private async runFindOperation(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType[]> {
    const headers = await this.getHeaders()
    const findOperation = new FindSheetOperation<RecordType>(
      {
        sheet: this.sheet,
        credentials: {
          spreadsheetId: this.spreadsheetId,
          auth: this.sheets.getAuth()
        },
        sheets: this.sheets,
        schema: this.schema,
        headerRow: this.headerRow,
        headers
      },
      options,
      configs
    )

    return findOperation.executeOperation()
  }

  /**
   * Finds and returns multiple records based on the provided options and configurations.
   *
   * @param options - The options to configure the find operation.
   * @param configs - Additional configurations for the operation.
   * @returns A promise that resolves to an array of records of type `RecordType`.
   */
  public async findMany(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType[]> {
    return await this.runFindOperation(options, configs)
  }
  /**
   * Finds the first record that matches the given options and configurations.
   *
   * @param options - The options to use for the find operation.
   * @param configs - The configurations to use for the find operation.
   * @returns A promise that resolves to the first record that matches the criteria.
   */
  public async findFirst(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType> {
    const result = await this.runFindOperation(options, configs)
    return result[0]
  }
  /**
   * Finds a unique record based on the provided options and configurations.
   *
   * @param options - The options to use for the find operation.
   * @param configs - The configurations to use for the find operation.
   * @returns A promise that resolves to the unique record found.
   * @throws MultipleRecordsFoundForUniqueError - If more than one record is found.
   */
  public async findUnique(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType> {
    const result = await this.runFindOperation(options, configs)
    if (result.length > 1) {
      throw new MultipleRecordsFoundForUniqueError()
    }
    return result[0]
  }

  public async findAll(
    options: Omit<OperationOptions<RecordType>, 'where'>,
    configs: OperationConfigs
  ): Promise<RecordType[]> {
    return await this.runFindOperation(options, configs)
  }

  public async findLast(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType> {
    const result = await this.runFindOperation(options, configs)
    return result[result.length - 1]
  }

  public async clearMany(
    options: OperationOptions<RecordType>,
    configs: OperationConfigs
  ): Promise<RecordType[]> {
    const result = await this.runClearOperation(options, configs)
    return result
  }
}

export { DataTypes }
