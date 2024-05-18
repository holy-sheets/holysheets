import HollySheets from './index'

describe('HollySheets', () => {
  const credentials = {
    clientEmail: 'test@example.com',
    privateKey: 'private_key',
    spreadsheetId: 'spreadsheet_id'
  }

  const hollySheets = new HollySheets(credentials)

  describe('insert', () => {
    it('should insert data into the spreadsheet', async () => {
      
    })
  })
})