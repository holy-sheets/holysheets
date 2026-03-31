import { IHolySheetsPublic } from '@/mixins/IHolySheetsPublic'
import { OperationOptions } from '@/operations/types/BaseOperation.types'
import { FindPublicOperation } from '@/operations/find-public/FindPublicOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import { Constructor } from '@/mixins/Constructor.type'

interface RunParams {
  throwRecordNotFoundError?: boolean
  throwMultipleRecordsFoundForUniqueError?: boolean
  slice?: [start: number, end?: number]
}

async function runPublicFindOperation<RecordType extends object>(
  instance: IHolySheetsPublic<RecordType>,
  options: OperationOptions<RecordType>,
  params?: RunParams
): Promise<RecordType[]> {
  const headers = await instance.getHeaders()
  const {
    throwRecordNotFoundError = false,
    throwMultipleRecordsFoundForUniqueError = false,
    slice = [0]
  } = params ?? {}

  const operation = new FindPublicOperation<RecordType>(
    {
      spreadsheetId: instance.spreadsheetId,
      sheet: instance.sheet,
      headerRow: instance.headerRow,
      headers,
      schema: instance.schema
    },
    options,
    slice
  )
  const result = await operation.execute()

  if (throwRecordNotFoundError && (!result || result.length === 0)) {
    throw new RecordNotFoundError()
  }
  if (throwMultipleRecordsFoundForUniqueError && result.length > 1) {
    throw new MultipleRecordsFoundForUniqueError()
  }
  return result
}

export function WithPublicFindOperations<
  RecordType extends object,
  TBase extends Constructor<IHolySheetsPublic<RecordType>>
>(Base: TBase) {
  return class extends Base {
    public async findMany(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType[]> {
      return await runPublicFindOperation(this, options)
    }

    public async findFirst(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        slice: [0, 1]
      })
      return result[0]
    }

    public async findUnique(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async findLast(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        slice: [-1]
      })
      return result[0]
    }

    public async findManyOrThrow(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType[]> {
      return await runPublicFindOperation(this, options, {
        throwRecordNotFoundError: true
      })
    }

    public async findFirstOrThrow(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        throwRecordNotFoundError: true,
        slice: [0, 1]
      })
      return result[0]
    }

    public async findUniqueOrThrow(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        throwRecordNotFoundError: true,
        throwMultipleRecordsFoundForUniqueError: true,
        slice: [0, 2]
      })
      return result[0]
    }

    public async findLastOrThrow(
      options: OperationOptions<RecordType> = {}
    ): Promise<RecordType> {
      const result = await runPublicFindOperation(this, options, {
        throwRecordNotFoundError: true,
        slice: [-1]
      })
      return result[0]
    }
  }
}
