import { HolySheetsError } from '@/errors/HolySheetsError'
import { ErrorCodes } from '@/errors/ErrorCodes'
import { SheetNotFoundError } from '@/errors/SheetNotFoundError'
import { AuthenticationError } from '@/errors/AuthenticationError'
import { NoHeadersError } from '@/errors/NoHeadersError'
import { InvalidHeaderError } from '@/errors/InvalidHeaderError'
import { DuplicatedHeaderError } from '@/errors/DuplicatedHeaderError'
import { HeaderColumn } from '@/services/header/HeaderService.types'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'

/**
 * HeaderService in non-generic Singleton mode.
 * Returns a list of objects in the format [{ header: "taskId", column: 0 }, ... ].
 */
export class HeaderService {
  private static instance: HeaderService

  private readonly headerListCache: Map<string, HeaderColumn[]> = new Map()

  private constructor(private readonly sheets: SheetsAdapterService) {}

  /**
   * Returns the singleton instance of HeaderService, without generics.
   */
  public static getInstance(sheets: SheetsAdapterService): HeaderService {
    if (!HeaderService.instance) {
      HeaderService.instance = new HeaderService(sheets)
    }
    return HeaderService.instance
  }

  /**
   * Returns a list of objects { header, column }, where 'header' is the column name
   * and 'column' is the 0-based index.
   *
   * @param spreadsheetId - The ID of the spreadsheet
   * @param sheet - The name of the sheet
   * @param headerRow - The row where the headers are located (default = 1)
   * @returns Promise<HeaderColumn[]>
   *
   * Example:
   * [
   *   { header: "taskId", column: 0 },
   *   { header: "title", column: 1 },
   *   { header: "dueDate", column: 2 }
   * ]
   */
  public async getHeaders(
    spreadsheetId: string,
    sheet: string,
    headerRow = 1
  ): Promise<HeaderColumn[]> {
    const cacheKey = `${spreadsheetId}:${sheet}`
    if (this.headerListCache.has(cacheKey)) {
      return this.headerListCache.get(cacheKey) as HeaderColumn[]
    }

    try {
      const headersData = await this.sheets.getSingleRow(sheet, headerRow)
      if (!headersData || headersData.length === 0) {
        throw new NoHeadersError(sheet)
      }

      const headersArray = headersData.map(header => header?.trim() || '')

      if (headersArray.some(header => header === '')) {
        throw new InvalidHeaderError(sheet)
      }

      // Verifica duplicados
      const headerSet = new Set<string>()
      for (const h of headersArray) {
        if (headerSet.has(h)) {
          throw new DuplicatedHeaderError(sheet, h)
        }
        headerSet.add(h)
      }

      // Constrói a lista de cabeçalhos com seus respectivos índices
      const headerList: HeaderColumn[] = headersArray.map((header, index) => ({
        header,
        column: index
      }))

      this.headerListCache.set(cacheKey, headerList)
      return headerList
    } catch (error: unknown) {
      if (
        error instanceof SheetNotFoundError ||
        error instanceof AuthenticationError
      ) {
        throw error
      } else if (error instanceof HolySheetsError) {
        throw error
      } else if (error instanceof Error) {
        throw new HolySheetsError(
          `An unknown error occurred while fetching headers: ${error.message}`,
          ErrorCodes.UNKNOWN_ERROR
        )
      }
      throw new HolySheetsError(
        'An unknown error occurred while fetching headers.',
        ErrorCodes.UNKNOWN_ERROR
      )
    }
  }

  /**
   * Retorna somente os nomes dos cabeçalhos (array de strings),
   * a partir da lista de objetos { header, column }.
   */
  public async getHeadersArray(
    spreadsheetId: string,
    sheet: string,
    headerRow = 1
  ): Promise<string[]> {
    const headersList = await this.getHeaders(spreadsheetId, sheet, headerRow)
    return headersList.map(item => item.header)
  }

  /**
   * Limpa o cache de cabeçalhos para uma planilha específica.
   */
  public clearCache(spreadsheetId: string, sheet: string): void {
    const cacheKey = `${spreadsheetId}:${sheet}`
    this.headerListCache.delete(cacheKey)
  }
}
