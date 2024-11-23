import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateMany } from '@/core/updateMany/updateMany'
import { findMany } from '@/core/findMany'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { SheetRecord } from '@/types/sheetRecord'

// Mockar a função findMany
vi.mock('@/core/findMany')

// Importar a função mockada
const mockedFindMany = vi.mocked(findMany)

// Definir uma implementação mock de IGoogleSheetsService
const mockSheets: IGoogleSheetsService = {
  getValues: vi.fn(),
  batchGetValues: vi.fn(),
  updateValues: vi.fn(),
  batchUpdateValues: vi.fn(),
  clearValues: vi.fn(),
  batchClearValues: vi.fn(),
  deleteRows: vi.fn(),
  batchDeleteRows: vi.fn(),
  getSpreadsheet: vi.fn(),
  getAuth: vi.fn()
}

describe('updateMany', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should successfully update multiple matching records and return the updated data', async () => {
    // Definir parâmetros de entrada
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      {
        Status: 'inactive'
      }

    // Mockar a função findMany para retornar múltiplos registros
    const foundRecords: SheetRecord<{
      Name: string
      Age: string
      Status: string
    }>[] = [
      {
        range: 'TestSheet!A2:C2',
        row: 2,
        fields: { Name: 'Alice', Age: '30', Status: 'active' }
      },
      {
        range: 'TestSheet!A4:C4',
        row: 4,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      },
      {
        range: 'TestSheet!A6:C6',
        row: 6,
        fields: { Name: 'Charlie', Age: '35', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValueOnce(foundRecords)

    // Mockar batchUpdateValues para resolver
    ;(
      mockSheets.batchUpdateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Chamar a função sob teste
    const result = await updateMany(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate }
    )

    // Asserções para garantir que as dependências foram chamadas corretamente
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockSheets.batchUpdateValues).toHaveBeenCalledWith(
      [
        {
          range: 'TestSheet!A2:C2',
          values: [['Alice', '30', 'inactive']]
        },
        {
          range: 'TestSheet!A4:C4',
          values: [['Bob', '25', 'inactive']]
        },
        {
          range: 'TestSheet!A6:C6',
          values: [['Charlie', '35', 'inactive']]
        }
      ],
      'RAW'
    )

    // Asserção para verificar o valor de retorno da função
    expect(result).toEqual([
      { Name: 'Alice', Age: '30', Status: 'inactive' },
      { Name: 'Bob', Age: '25', Status: 'inactive' },
      { Name: 'Charlie', Age: '35', Status: 'inactive' }
    ])
  })

  it('should throw an error when no matching records are found', async () => {
    // Definir parâmetros de entrada
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      {
        Status: 'inactive'
      }

    // Mockar a função findMany para retornar um array vazio (nenhum registro encontrado)
    mockedFindMany.mockResolvedValueOnce([])

    // Chamar a função sob teste e esperar um erro
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('No records found to update')

    // Asserções para garantir que findMany foi chamado corretamente
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Asserção para garantir que batchUpdateValues NÃO foi chamado
    expect(mockSheets.batchUpdateValues).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the findMany function', async () => {
    // Definir parâmetros de entrada
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      {
        Status: 'inactive'
      }

    // Mockar a função findMany para lançar um erro
    const findManyError = new Error('findMany encountered an error')
    mockedFindMany.mockRejectedValueOnce(findManyError)

    // Chamar a função sob teste e esperar que o erro seja propagado
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('findMany encountered an error')

    // Asserções para garantir que findMany foi chamado corretamente
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Asserção para garantir que batchUpdateValues NÃO foi chamado
    expect(mockSheets.batchUpdateValues).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the Google Sheets API during the batch update', async () => {
    // Definir parâmetros de entrada
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      {
        Status: 'inactive'
      }

    // Mockar a função findMany para retornar múltiplos registros
    const foundRecords: SheetRecord<{
      Name: string
      Age: string
      Status: string
    }>[] = [
      {
        range: 'TestSheet!A2:C2',
        row: 2,
        fields: { Name: 'Alice', Age: '30', Status: 'active' }
      },
      {
        range: 'TestSheet!A4:C4',
        row: 4,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      },
      {
        range: 'TestSheet!A6:C6',
        row: 6,
        fields: { Name: 'Charlie', Age: '35', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValueOnce(foundRecords)

    // Mockar batchUpdateValues para lançar um erro
    const apiError = new Error('Google Sheets API Error')
    ;(
      mockSheets.batchUpdateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(apiError)

    // Chamar a função sob teste e esperar que o erro seja propagado
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('Error updating records: Google Sheets API Error')

    // Asserções para garantir que findMany foi chamado corretamente
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Asserções para garantir que batchUpdateValues foi chamado corretamente
    expect(mockSheets.batchUpdateValues).toHaveBeenCalledWith(
      [
        {
          range: 'TestSheet!A2:C2',
          values: [['Alice', '30', 'inactive']]
        },
        {
          range: 'TestSheet!A4:C4',
          values: [['Bob', '25', 'inactive']]
        },
        {
          range: 'TestSheet!A6:C6',
          values: [['Charlie', '35', 'inactive']]
        }
      ],
      'RAW'
    )
  })

  it('should update only matching records without affecting others', async () => {
    // Definir parâmetros de entrada
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '25' }

    // Mockar a função findMany para retornar apenas os registros de Alice
    const foundRecords: SheetRecord<{ Name: string; Age: string }>[] = [
      {
        range: 'TestSheet!A2:B2',
        row: 2,
        fields: { Name: 'Alice', Age: '20' }
      },
      {
        range: 'TestSheet!A4:B4',
        row: 4,
        fields: { Name: 'Alice', Age: '23' }
      }
    ]
    mockedFindMany.mockResolvedValueOnce(foundRecords)

    // Mockar batchUpdateValues para resolver
    ;(
      mockSheets.batchUpdateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Chamar a função sob teste
    const result = await updateMany(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate }
    )

    // Asserções para garantir que as dependências foram chamadas corretamente
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockSheets.batchUpdateValues).toHaveBeenCalledWith(
      [
        {
          range: 'TestSheet!A2:B2',
          values: [['Alice', '25']]
        },
        {
          range: 'TestSheet!A4:B4',
          values: [['Alice', '25']]
        }
      ],
      'RAW'
    )

    // Asserção para verificar o valor de retorno da função
    expect(result).toEqual([
      { Name: 'Alice', Age: '25' },
      { Name: 'Alice', Age: '25' }
    ])
  })
})
