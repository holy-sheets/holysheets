import credentials from './.credentials.json'
import HollySheets from './src/sheets'

const sheets = new HollySheets({
  clientEmail: credentials.client_email,
  privateKey: credentials.private_key
})

interface Person {
  name: string
  age: number
}

sheets.base<Person>('Person').insert({ name: 'John Doe'}) 
