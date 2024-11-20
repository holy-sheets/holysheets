export type SelectClause<RecordType> = Partial<{
  [column in keyof RecordType]: boolean
}>
