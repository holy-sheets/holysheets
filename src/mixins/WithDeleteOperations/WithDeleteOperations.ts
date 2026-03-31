import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationOptions,
  OperationConfigs,
  OperationOptionsWithSlice
} from '@/operations/types/BaseOperation.types'
import { DeleteOperation } from '@/operations/delete/DeleteOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

interface RunParams {
  throwRecordNotFoundError?: boolean
  throwMultipleRecordsFoundForUniqueError?: boolean
  slice?: [start: number, end?: number]
}

async function runDeleteOperation<RecordType extends object>(
  holysheets: IHolySheets<RecordType>,
  options: OperationOptions<RecordType>,
  configs: OperationConfigs,
  params?: RunParams
): Promise<RecordType[]> {
  const headers = await holysheets.getHeaders()
  const {
    throwRecordNotFoundError = false,
    throwMultipleRecordsFoundForUniqueError = false,
    slice = [0]
  } = params ?? {}
  const deleteOperation = new DeleteOperation<RecordType>(
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
  const result = await deleteOperation.executeOperation()
  if (throwRecordNotFoundError && (!result || result.length === 0)) {
    throw new RecordNotFoundError()
  }
  if (throwMultipleRecordsFoundForUniqueError && result.length > 1) {
    throw new MultipleRecordsFoundForUniqueError()
  }
  return result
}

export function WithDeleteOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async deleteSlice(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs, {
        slice: options.slice
      })
    }

    public async deleteMany(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs)
    }

    public async deleteFirst(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [0, 1]
      })
      return result[0]
    }

    public async deleteUnique(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async deleteLast(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [-1]
      })
      return result[0]
    }

    public async deleteAll(
      options: OperationOptions<RecordType>,
      configs: Omit<OperationConfigs, 'where'>
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs)
    }

    public async deleteSliceOrThrow(
      options: OperationOptionsWithSlice<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: options.slice
      })
    }

    public async deleteManyOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async deleteFirstOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [0, 1]
      })
      return result[0]
    }

    public async deleteUniqueOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async deleteLastOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [-1]
      })
      return result[0]
    }

    public async deleteAllOrThrow(
      options: OperationOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runDeleteOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }
  }
}
