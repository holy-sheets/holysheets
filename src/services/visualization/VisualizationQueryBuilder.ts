import { WhereClause, WhereCondition } from '@/services/where/types/where.types'
import { HeaderColumn } from '@/services/header/HeaderService.types'

function indexToColumnLetter(index: number): string {
  let column = ''
  let remaining = index
  while (remaining >= 0) {
    const remainder = remaining % 26
    column = String.fromCharCode(65 + remainder) + column
    remaining = Math.floor(remaining / 26) - 1
    if (remaining < 0) break
  }
  return column
}

function escapeGvizString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function buildCondition(
  columnLetter: string,
  filter: WhereCondition | string
): string {
  if (typeof filter === 'string') {
    return `${columnLetter} = '${escapeGvizString(filter)}'`
  }

  const parts: string[] = []

  if (filter.equals !== undefined) {
    parts.push(`${columnLetter} = '${escapeGvizString(String(filter.equals))}'`)
  }
  if (filter.not !== undefined) {
    parts.push(`${columnLetter} != '${escapeGvizString(String(filter.not))}'`)
  }
  if (filter.in !== undefined) {
    const values = (filter.in as string[])
      .map(v => `${columnLetter} = '${escapeGvizString(v)}'`)
      .join(' OR ')
    parts.push(`(${values})`)
  }
  if (filter.notIn !== undefined) {
    const values = (filter.notIn as string[])
      .map(v => `${columnLetter} != '${escapeGvizString(v)}'`)
      .join(' AND ')
    parts.push(`(${values})`)
  }
  if (filter.lt !== undefined) {
    parts.push(`${columnLetter} < ${filter.lt}`)
  }
  if (filter.lte !== undefined) {
    parts.push(`${columnLetter} <= ${filter.lte}`)
  }
  if (filter.gt !== undefined) {
    parts.push(`${columnLetter} > ${filter.gt}`)
  }
  if (filter.gte !== undefined) {
    parts.push(`${columnLetter} >= ${filter.gte}`)
  }
  if (filter.contains !== undefined) {
    parts.push(
      `${columnLetter} contains '${escapeGvizString(String(filter.contains))}'`
    )
  }
  if (filter.startsWith !== undefined) {
    parts.push(
      `${columnLetter} starts with '${escapeGvizString(String(filter.startsWith))}'`
    )
  }
  if (filter.endsWith !== undefined) {
    parts.push(
      `${columnLetter} ends with '${escapeGvizString(String(filter.endsWith))}'`
    )
  }
  if (filter.search !== undefined) {
    parts.push(
      `${columnLetter} matches '${escapeGvizString(String(filter.search))}'`
    )
  }

  return parts.join(' AND ')
}

export class VisualizationQueryBuilder<RecordType> {
  private readonly where: WhereClause<RecordType>
  private readonly headers: HeaderColumn[]

  constructor(where: WhereClause<RecordType>, headers: HeaderColumn[]) {
    this.where = where
    this.headers = headers
  }

  public build(): string {
    const whereClause = this.buildWhereClause()
    if (whereClause) {
      return `SELECT * WHERE ${whereClause}`
    }
    return 'SELECT *'
  }

  private buildWhereClause(): string {
    const keys = Object.keys(this.where) as (keyof RecordType)[]
    if (keys.length === 0) {
      return ''
    }

    const conditions = keys.map(key => {
      const header = this.headers.find(h => h.header === String(key))
      if (!header) {
        return ''
      }
      const columnLetter = indexToColumnLetter(header.column)
      const filter = this.where[key] as WhereCondition | string
      return buildCondition(columnLetter, filter)
    })

    return conditions.filter(c => c.length > 0).join(' AND ')
  }
}
