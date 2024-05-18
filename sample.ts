import HollySheets from './index'
import credentials from './.credentials.json'

const hollySheets = new HollySheets({
  spreadsheetId: '10EQjKl96GqZFrSSoJKHdJFpAwRfvCzaQY3-u85IBpEA',
  privateKey: credentials.private_key,
  clientEmail: credentials.client_email
})

interface User {
  name: string
  email: string
}

const main = async () => {
  const users = hollySheets.base<User>('Users')
  const user = await users.findMany({
    where: {
      name: {
        contains: 'John'      
      }
    }
  })  
  console.log(user) // eslint-disable-line no-console
}

void main()

