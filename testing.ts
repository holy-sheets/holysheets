import credentials from './.credentials.json'
import HollySheets from './src/sheets'

const sheets = new HollySheets({
  clientEmail: credentials.client_email,
  privateKey: credentials.private_key,
  spreadsheetId: '10EQjKl96GqZFrSSoJKHdJFpAwRfvCzaQY3-u85IBpEA'
})

interface Person {
  name: string
  age: number
}

void sheets.base<Person>('Person').insert({
  data: [{
    name: 'Alice',
    age: 30
  }]
})
