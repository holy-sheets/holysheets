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

3. Initialize HolySheets!:

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

---

## Public Read-Only Mode

If you only need to **read** data from a public Google Sheet, you can skip authentication entirely using the public mode. This uses the [Google Visualization API](https://developers.google.com/chart/interactive/docs/querylanguage) under the hood.

> **Note**: The spreadsheet must be published or shared as "Anyone with the link can view".

```Typescript
import HolySheets from 'holysheets'

const reader = HolySheets.public({
  spreadsheetId: 'YOUR_PUBLIC_SPREADSHEET_ID'
})

const products = reader.base<{ name: string; price: string }>('Products')

const results = await products.findMany({
  where: { name: { contains: 'Widget' } }
})
console.log(results)
```

In public mode, only **find** methods are available (`findFirst`, `findMany`, `findUnique`, `findLast`, and their `OrThrow` variants). Write operations (insert, update, delete, clear) are not available.

For more details, see the [Public Mode guide](/en/guides/public-mode).

---

Check out the guides and concepts sections for deeper explanations.
