import { IHolySheets } from '@/mixins/IHolySheets'
import {
  OperationConfigs,
  OperationOptionsWithSlice,
  UpdateOperationOptions
} from '@/operations/types/BaseOperation.types'
import { UpdateOperation } from '@/operations/update/UpdateOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

interface UpdateOptions<RecordType> {
  where?: UpdateOperationOptions<RecordType>['where']
  select?: UpdateOperationOptions<RecordType>['select']
  omit?: UpdateOperationOptions<RecordType>['omit']
  data: Partial<RecordType>
}

interface RunParams {
  throwRecordNotFoundError?: boolean
  throwMultipleRecordsFoundForUniqueError?: boolean
  slice?: [start: number, end?: number]
}

async function runUpdateOperation<RecordType extends object>(
  holysheets: IHolySheets<RecordType>,
  options: UpdateOptions<RecordType>,
  configs: OperationConfigs,
  params?: RunParams
): Promise<RecordType[]> {
  const headers = await holysheets.getHeaders()
  const {
    throwRecordNotFoundError = false,
    throwMultipleRecordsFoundForUniqueError = false,
    slice = [0]
  } = params ?? {}
  const updateOperation = new UpdateOperation<RecordType>(
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
  const result = await updateOperation.executeOperation()
  if (throwRecordNotFoundError && (!result || result.length === 0)) {
    throw new RecordNotFoundError()
  }
  if (throwMultipleRecordsFoundForUniqueError && result.length > 1) {
    throw new MultipleRecordsFoundForUniqueError()
  }
  return result
}

export function WithUpdateOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheets<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async updateMany(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runUpdateOperation(this, options, configs)
    }

    public async updateFirst(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [0, 1]
      })
      return result[0]
    }

    public async updateUnique(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async updateLast(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: false,
        slice: [-1]
      })
      return result[0]
    }

    public async updateManyOrThrow(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType[]> {
      return await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: true
      })
    }

    public async updateFirstOrThrow(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [0, 1]
      })
      return result[0]
    }

    public async updateUniqueOrThrow(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async updateLastOrThrow(
      options: UpdateOptions<RecordType>,
      configs: OperationConfigs
    ): Promise<RecordType> {
      const result = await runUpdateOperation(this, options, configs, {
        throwRecordNotFoundError: true,
        slice: [-1]
      })
      return result[0]
    }
  }
}
