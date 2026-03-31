import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationOptions,
  OperationConfigs,
  OperationOptionsWithSlice
} from '@/operations/types/BaseOperation.types'
import { ClearOperation } from '@/operations/clear/ClearOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

interface RunParams {
  throwRecordNotFoundError?: boolean
  throwMultipleRecordsFoundForUniqueError?: boolean
  slice?: [start: number, end?: number]
}

async function runClearOperation<RecordType extends object>(
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
  const clearOperation = new ClearOperation<RecordType>(
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
  const result = await clearOperation.executeOperation()
  if (throwRecordNotFoundError && (!result || result.length === 0)) {
    throw new RecordNotFoundError()
  }
  if (throwMultipleRecordsFoundForUniqueError && result.length > 1) {
    throw new MultipleRecordsFoundForUniqueError()
  }
  return result
}

export function WithClearOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async clearSlice(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs, {
        slice: options.slice
      })
    }

    public async clearMany(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs)
    }

    public async clearFirst(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [0, 1]
      })
      return result[0]
    }

    public async clearUnique(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async clearLast(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [-1]
      })
      return result[0]
    }

    public async clearAll(
      options: OperationOptions<RecordType>,
      configs: Omit<OperationConfigs, 'where'>
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs)
    }

    public async clearSliceOrThrow(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async clearManyOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async clearFirstOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [0, 1]
      })
      return result[0]
    }

    public async clearUniqueOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async clearLastOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType> {
      const result = await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [-1]
      })
      return result[0]
    }

    public async clearAllOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs = { includeMetadata: false }
    ): Promise<RecordType[]> {
      return await runClearOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }
  }
}
