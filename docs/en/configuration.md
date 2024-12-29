# Configuration

**HolySheets!** requires a few key parameters and setup steps before you can begin interacting with your Google Sheets data. Below is a more detailed overview of the necessary configurations.

---

## Quick Start

1. **Install HolySheets!**

```bash
pnpm install holysheets
```

2. **Obtain Google Credentials**

   - Create a **Google Cloud project** and enable the _Google Sheets API_.
   - Generate the appropriate **credentials** (JWT or OAuth2) with permission to access the intended spreadsheet.
   - For more information about authentication check [JWT](/en/authentication/jwt) and [OAuth](/en/authentication/oauth)

3. **Initialize HolySheets**

Pass both `spreadsheetId` and `auth` to the **HolySheets** constructor:

```Typescript
import HolySheets from 'holysheets'
import { authClient } from './your-auth-setup'

const holySheetsInstance = new HolySheets({
    spreadsheetId: 'your-spreadsheet-id',
    auth: authClient
})
```

---

## Essential Configuration Parameters

### `spreadsheetId`

- **Description**: The unique ID of your Google Spreadsheet, which can be found in the spreadsheet’s URL.
- **Example**:

```text
https://docs.google.com/spreadsheets/d/1AbCDefGhIJkLMNOPQRS_TUVWXYZ/edit#gid=0
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Everything between `d/` and `/edit` is your `spreadsheetId`.

---

### `auth`

- **Description**: An authenticated Google client capable of calling the Sheets API.
- **Supported Auth Types**:
  - **JWT (Service Account)**: Commonly used for server-to-server communications.
  - **OAuth2**: Used when you need user consent to access their Google Sheets.
- **Example (JWT)**:

```Typescript
import { google } from 'googleapis'

const authClient = new google.auth.JWT(serviceAccountEmail, null, privateKey, [
  'https://www.googleapis.com/auth/spreadsheets'
])
```

- **Example (OAuth2)**:

```Typescript
import { google } from 'googleapis'

const authClient = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
// Then use authClient.getToken(...) and authClient.setCredentials(...) as needed
```

---

## Specifying a Sheet

Once you have an instance of **HolySheets**, you can target a particular sheet (tab) within your spreadsheet by calling `base(sheetTitle)`:

```Typescript
const userSheet = holySheetsInstance.base('Users')

// Now all operations (find, insert, etc.) are performed against the "Users" sheet.
```

**Note**: If you omit `base(...)` or don’t specify a `sheet`, operations typically fail because the system doesn’t know which tab to target.

---

## Additional Tips

- **Permissions**: Your auth client must have permission to read/write the specified spreadsheet (depending on the operations you intend to perform).
- **Sheet Titles**: Keep your sheet (tab) names descriptive (e.g., `Orders`, `Users`, `Inventory`). You’ll use these names in `base(sheetTitle)`.
- **Environment Variables**: Consider storing your `spreadsheetId` and auth credentials in environment variables or a secure vault for better security and portability.

---

## Putting It All Together

```Typescript
// Example of a final setup:
import { google } from 'googleapis'
import HolySheets from 'holysheets'

async function createHolySheetsInstance() {
  // 1. Auth - Service Account example
  const authClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  )

  // 2. Construct HolySheets
  const holySheetsInstance = new HolySheets({
    spreadsheetId: process.env.SPREADSHEET_ID as string,
    auth: authClient
  })

  // 3. Select the "Users" sheet
  const userSheet = holySheetsInstance.base('Users')

  // 4. Perform an operation (e.g., insert)
  const insertResult = await userSheet.insert({
    data: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ]
  })

  console.log(insertResult)
}

createHolySheetsInstance().catch(console.error)
```

Following these steps ensures that **HolySheets!** is properly configured and ready to handle your data operations on Google Sheets.
