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
 * Representa cada cabeçalho como { header: string, column: number }.
 */

/**
 * HeaderService em modo Singleton NÃO genérico.
 * Retorna uma lista de objetos no formato [{ header: "taskId", column: 0 }, ... ].
 */
export class HeaderService {
  private static instance: HeaderService

  // Em vez de cachear `Record<string, number>`, cacheamos um array de {header, column}.
  private readonly headerListCache: Map<string, HeaderColumn[]> = new Map()

  private constructor(private readonly sheets: SheetsAdapterService) {}

  /**
   * Retorna a instância singleton do HeaderService, sem generics.
   */
  public static getInstance(sheets: SheetsAdapterService): HeaderService {
    if (!HeaderService.instance) {
      HeaderService.instance = new HeaderService(sheets)
    }
    return HeaderService.instance
  }

  /**
   * Retorna uma lista de objetos { header, column }, onde 'header' é o nome da coluna
   * e 'column' é o índice (0-based).
   *
   * @param spreadsheetId - O ID da planilha
   * @param sheet - O nome da folha
   * @param headerRow - A linha em que se encontram os headers (padrão = 1)
   * @returns Promise<HeaderColumn[]>
   *
   * Exemplo:
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
