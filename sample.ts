import HollySheets from './src/index'
import credentials from './.credentials.json'

const hollySheets = new HollySheets({
  spreadsheetId: '10EQjKl96GqZFrSSoJKHdJFpAwRfvCzaQY3-u85IBpEA',
  privateKey: credentials.private_key,
  clientEmail: credentials.client_email
})

const main = async () => {
  interface User {
    name: string
    email: string
    age: number
  }

  const user = hollySheets.base<User>('Users')
  const joses = await user.findMany({
    where: {
      name: {
        contains: 'Jose'
      }
    }
  })
  console.log(JSON.stringify(joses, null, 4)) // eslint-disable-line
}

void main()
