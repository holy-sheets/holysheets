---
title: JWT Authentication
description: Comprehensive guide to setting up JWT (Service Account) authentication with HolySheets!.
---

# JWT Authentication

HolySheets! supports multiple authentication methods to securely interact with your Google Sheets. This guide focuses on **JWT (Service Account) Authentication**, providing step-by-step instructions to configure a service account in Google Cloud Console, integrate it with HolySheets!, and perform a simple data insertion example.

## Configuring JWT Credentials in Google Cloud Console

To enable HolySheets! to access your Google Sheets securely using JWT, you need to set up a **Service Account** in the Google Cloud Console. Follow these steps to configure the necessary credentials.

## 1. Enable Google Sheets API

1. **Access Google Cloud Console:**

   - Navigate to [Google Cloud Console](https://console.cloud.google.com/).

2. **Select or Create a Project:**

   - Click on the project dropdown at the top-left corner.
   - Select an existing project or click **"New Project"** to create a new one.

3. **Enable the Google Sheets API:**

   - From the left sidebar, go to **"APIs & Services" > "Library"**.
   - Search for **"Google Sheets API"**.
   - Click on **"Google Sheets API"** from the search results.
   - Click **"Enable"**.

## 2. Create a Service Account

1. **Navigate to Service Accounts:**

   - From the left sidebar, go to **"APIs & Services" > "Credentials"**.
   - Click on **"Create Credentials"** and select **"Service Account"**.

2. **Configure Service Account Details:**

   - **Service Account Name:** e.g., `HolySheets! Service Account`.
   - **Service Account Description:** Optional.
   - Click **"Create and Continue"**.

3. **Grant Service Account Access to Project:**

   - Assign appropriate roles. For accessing Google Sheets, roles related to **"Editor"** or **"Sheets API"** are sufficient.
   - Click **"Continue"**.

4. **Grant Users Access to This Service Account:** (Optional)
   - Click **"Done"**.

## 3. Generate and Download Service Account Key

1. **Create a Key for the Service Account:**

   - In the **"Credentials"** page, locate your newly created service account.
   - Click on the **three dots (⋮)** under **"Actions"** and select **"Manage keys"**.
   - Click **"Add Key"** > **"Create new key"**.
   - Choose **"JSON"** as the key type and click **"Create"**.

2. **Download the Key:**

   - A JSON key file will be downloaded automatically. **Store this file securely**, as it contains sensitive information.
   - **Important:** Do not expose this file publicly or commit it to version control systems.

## 4. Share Your Google Sheet with the Service Account

1. **Open Your Google Sheet:**

   - Navigate to the Google Sheet you intend to access with HolySheets!.

2. **Share the Sheet with the Service Account:**

   - Click the **"Share"** button.
   - In the **"Add people and groups"** field, enter the **service account's email** (found in the JSON key file under `client_email`).
   - Assign **Editor** permissions.
   - Click **"Send"**.

---

## 5. Integrating JWT with HolySheets

With your service account credentials obtained and your Google Sheet shared with the service account, you can now integrate JWT authentication into your HolySheets! project.

## 6. Initializing the JWT Client

Create a file named `jwtAuth.ts` in your project's `src` directory to handle JWT client initialization.

```typescript
// src/jwtAuth.ts
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

const serviceAccountPath = path.join(
  __dirname,
  '..',
  'path-to-your-service-account-key.json'
) // Update the path accordingly

/**
 * Initializes the JWT client.
 *
 * @returns Configured JWT client.
 */
export function initializeJWTClient() {
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf-8')
  )

  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'],
    undefined
  )

  return jwtClient
}
```

**Notes**:

- Replace `path-to-your-service-account-key.json` with the actual relative path to your downloaded service account JSON key file.
- Ensure that the key file is excluded from version control by adding it to your .gitignore:

```bash
path-to-your-service-account-key.json
```

## 7. Integrating HolySheets! with JWT

Create or update your jwtIndex.ts file in the src directory to set up HolySheets! with the JWT client.

```typescript
// src/jwtIndex.ts
import HolySheets from 'holysheets'
import { initializeJWTClient } from './jwtAuth'

const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE' // Replace with your actual Spreadsheet ID

/**
 * Initializes the HolySheets instance with JWT authentication.
 *
 * @returns An instance of HolySheets configured with JWT.
 */
async function initializeHolySheetsJWT() {
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is not defined.')
  }

  const jwtClient = initializeJWTClient()

  const sheets = new HolySheets({
    spreadsheetId,
    auth: jwtClient
  })

  // Replace 'Sheet1' with the name of your sheet/tab
  const table = sheets.base<{ Name: string; Age: string }>('Sheet1')

  return table
}

export default initializeHolySheetsJWT
```

**Notes**:

- Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Google Sheets ID, which can be found in the sheet’s URL.
