import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'
import { FindOperation } from '@/operations/find/FindOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

async function runFindOperation<RecordType extends object>(
  holysheets: IHolySheets<RecordType>,
  options: OperationOptions<RecordType>,
  configs: OperationConfigs
): Promise<RecordType[]> {
  const headers = await holysheets.getHeaders()
  const findOperation = new FindOperation<RecordType>(
    {
      sheet: holysheets.sheet,
      credentials: {
        spreadsheetId: holysheets.spreadsheetId,
        auth: holysheets.sheets.getAuth()
      },
      sheets: holysheets.sheets,
      schema: holysheets.schema,
      headerRow: holysheets.headerRow,
      headers
    },
    options,
    configs
  )
  return findOperation.executeOperation()
}

export function WithFindOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async findMany(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return runFindOperation(this, options, configs)
    }

    public async findFirst(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result[0]
    }

    public async findUnique(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (result.length > 1) {
        throw new MultipleRecordsFoundForUniqueError()
      }
      if (result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result[0]
    }

    public async findLast(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result[result.length - 1]
    }

    public async findAll(
      options: OperationOptions<RecordType>,
      configs: Omit<OperationConfigs, 'where'>
    ): Promise<RecordType[]> {
      return runFindOperation(this, options, configs)
    }

    public async findManyOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      const result = await runFindOperation(this, options, configs)
      if (!result || result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result
    }

    public async findFirstOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (!result || result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result[0]
    }

    public async findUniqueOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (!result || result.length === 0) {
        throw new RecordNotFoundError()
      }
      if (result.length > 1) {
        throw new MultipleRecordsFoundForUniqueError()
      }
      return result[0]
    }

    public async findLastOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs)
      if (!result || result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result[result.length - 1]
    }

    public async findAllOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      const result = await runFindOperation(this, options, configs)
      if (!result || result.length === 0) {
        throw new RecordNotFoundError()
      }
      return result
    }
  }
}
