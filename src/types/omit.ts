export type OmitClause<RecordType> = Partial<{
  [column in keyof RecordType]: boolean
}>
