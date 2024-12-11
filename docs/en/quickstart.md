# Quickstart

1. **Install**:

::: code-group

```bash [npm]
npm install holysheets
```

```bash [yarn]
yarn add holysheets
```

```bash [pnpm]
pnpm install holysheets
```

:::

2. Authenticate with Google APIs (using a Service Account or OAuth).

3. Initialize HolySheets:

```Typescript
import HolySheets from 'holysheets'

const sheets = new HolySheets({
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  auth: yourAuthClient
})

const users = sheets.base<{ name: string; email: string }>('Users')
```

4. Perform Operations:

```Typescript
await users.insert({ data: [{ name: 'Alice', email: 'alice@example.com' }] })
const found = await users.findMany({ where: { name: { equals: 'Alice' } } })
console.log(found.data)
```

Check out the guides and concepts sections for deeper explanations.
