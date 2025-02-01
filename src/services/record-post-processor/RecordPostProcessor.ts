import { OperationOptions } from '@/base-operation/types/BaseOperation.types'
import { RecordSchema } from '@/types/RecordSchema.types'
import { omitKeysFromObject, pickKeysFromObject } from '@/helpers/objectKeys'
import { SelectOmitConflictError } from '@/errors/SelectOmitConflictError'

interface RecordPostProcessorParams<RecordType> {
  records: RecordType[]
  schema: RecordSchema<RecordType> | null
}

export class RecordPostProcessor<RecordType extends object> {
  private readonly records: RecordType[]
  protected readonly schema: RecordSchema<RecordType> | null
  private readonly select: OperationOptions<RecordType>['select']
  private readonly omit: OperationOptions<RecordType>['omit']

  constructor(
    private readonly params: RecordPostProcessorParams<RecordType>,
    private readonly options: OperationOptions<RecordType>
  ) {
    this.records = params.records
    this.schema = params.schema ?? null
    this.select = options.select
    this.omit = options.omit
  }

  public process(): Partial<RecordType>[] {
    if (this.select && this.omit) {
      throw new SelectOmitConflictError()
    }
    if (this.select) {
      return this.filterKeys('select')
    }
    if (this.omit) {
      return this.filterKeys('omit')
    }
    return this.records
  }

  private filterKeys(strategy: 'select' | 'omit'): Partial<RecordType>[] {
    const keys: string[] = (this[strategy] || []).map(key => {
      const schemaKey = this.schema?.find(s => s.key === key)
      return (schemaKey?.as || key) as string
    })

    return this.records.map(record => {
      return strategy === 'select'
        ? pickKeysFromObject(record, keys as (keyof RecordType)[])
        : omitKeysFromObject(record, keys as (keyof RecordType)[])
    })
  }
}
