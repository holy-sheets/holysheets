export enum DataTypes {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date'
}

type DataTypesFromProperty<Prop> = Prop extends string
  ? DataTypes.STRING
  : Prop extends number
    ? DataTypes.NUMBER
    : Prop extends boolean
      ? DataTypes.BOOLEAN
      : Prop extends Date
        ? DataTypes.DATE
        : never

export interface SchemaItemForKey<RecordType, K extends keyof RecordType> {
  key: K
  as?: string
  type: DataTypesFromProperty<RecordType[K]>
  required?: boolean
  nullable?: boolean
  default?: RecordType[K]
}

export type RecordSchema<RecordType> = SchemaItemForKey<
  RecordType,
  keyof RecordType
>[]
