import { InvalidWhereFilterError } from '@/errors/InvalidWhereFilter'
import { InvalidWhereKeyError } from '@/errors/InvalidWhereKey'
import whereFilters from '@/services/where/whereFilters'
import { SingleColumn } from '@/services/header/HeaderService.types'
import { WhereClause, WhereFilterKey } from '@/types/where'

export class WhereService<RecordType> {
  private readonly where: WhereClause<RecordType>
  private readonly columns: SingleColumn[]
  private readonly headerRow: number

  constructor(
    where: WhereClause<RecordType>,
    columns: SingleColumn[],
    headerRow = 1
  ) {
    this.where = where
    this.columns = columns
    this.headerRow = headerRow
    this.validateKeys()
  }

  /**
   * Validates the keys in the `where` object to ensure they match the column headers.
   *
   * @throws {InvalidWhereKeyError} If any key in the `where` object does not match a column header.
   *
   * @private
   */
  private validateKeys(): void {
    const whereKeys = Object.keys(this.where) as (keyof RecordType)[]
    const columnHeaders = this.columns.map(col => col.header)
    whereKeys.forEach(key => {
      const keyAsString = String(key)
      if (!columnHeaders.includes(keyAsString)) {
        throw new InvalidWhereKeyError(keyAsString)
      }
    })
  }

  public matches(): number[] {
    const conditionKeys = Object.keys(this.where) as (keyof RecordType)[]
    // If there are no conditions, return all rows
    // based on the count of values in the first column
    // (or you can choose another logic)
    if (conditionKeys.length === 0) {
      // For example, we will use columns[0]?.values.length to know how many rows there are
      const totalRows = this.columns[0]?.values.length ?? 0
      return Array.from({ length: totalRows }, (_, i) => i + this.headerRow)
    }

    let matchedIndices: Set<number> | null = null

    conditionKeys.forEach(key => {
      // We find out which column corresponds to this key
      const keyString = String(key)
      const column = this.columns.find(col => col.header === keyString)
      if (!column) {
        throw new InvalidWhereKeyError(keyString)
      }
      const condition = this.where[key]
      const currentMatched = new Set<number>()

      column.values.forEach((cell, idx) => {
        let isMatch = false
        if (typeof condition === 'string') {
          // Simple case: if it's a string, we use "equals"
          isMatch = whereFilters.equals(cell, condition)
        } else if (typeof condition === 'object' && condition !== null) {
          // If it's an object, we go through all filters (logical AND)
          isMatch = Object.keys(condition).every(filterKey => {
            if (!(filterKey in whereFilters)) {
              throw new InvalidWhereFilterError(filterKey)
            }
            const expectedValue = condition[
              filterKey as WhereFilterKey
            ] as string
            const filterFn = whereFilters[
              filterKey as keyof typeof whereFilters
            ] as (value: string, expected: string) => boolean
            return filterFn(cell, expectedValue)
          })
        }
        if (isMatch) {
          // Adjust the index with headerRow
          currentMatched.add(idx + this.headerRow)
        }
      })

      if (matchedIndices === null) {
        matchedIndices = currentMatched
      } else {
        matchedIndices = new Set(
          [...matchedIndices].filter(idx => currentMatched.has(idx))
        )
      }
    })

    return matchedIndices ? Array.from(matchedIndices) : []
  }
}
