import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationOptions,
  OperationConfigs,
  OperationOptionsWithSlice
} from '@/operations/types/BaseOperation.types'
import { FindOperation } from '@/operations/find/FindOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

interface RunParams {
  throwRecordNotFoundError?: boolean
  throwMultipleRecordsFoundForUniqueError?: boolean
  slice?: [start: number, end?: number]
}

async function runFindOperation<RecordType extends object>(
  holysheets: IHolySheets<RecordType>,
  options: OperationOptions<RecordType>,
  configs: OperationConfigs = { includeMetadata: false },
  params?: RunParams
): Promise<RecordType[]> {
  const headers = await holysheets.getHeaders()
  const {
    throwRecordNotFoundError = false,
    throwMultipleRecordsFoundForUniqueError = false,
    slice = [0]
  } = params ?? {}
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
    { ...options, slice },
    configs
  )
  const result = await findOperation.executeOperation()
  if (throwRecordNotFoundError && (!result || result.length === 0)) {
    throw new RecordNotFoundError()
  }
  if (throwMultipleRecordsFoundForUniqueError && result.length > 1) {
    throw new MultipleRecordsFoundForUniqueError()
  }
  return result
}

export function WithFindOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async findSlice(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs, {
        slice: options.slice
      })
    }

    public async findMany(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs)
    }

    public async findFirst(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [0, 1]
      })
      return result[0]
    }

    public async findUnique(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async findLast(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [-1]
      })
      return result[0]
    }

    public async findAll(
      options: OperationOptions<RecordType>,
      configs: Omit<OperationConfigs, 'where'>
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs)
    }

    public async findSliceOrThrow(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async findManyOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async findFirstOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [0, 1]
      })
      return result[0]
    }

    public async findUniqueOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async findLastOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [-1]
      })
      return result[0]
    }

    public async findAllOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runFindOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }
  }
}
