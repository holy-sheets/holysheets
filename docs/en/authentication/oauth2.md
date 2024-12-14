---
title: Authentication
description: Comprehensive guide to setting up OAuth2 and JWT authentication with HolySheets.
---

# OAuth2 Authentication

OAuth2 is a widely-used authentication protocol that allows your application to access user data securely. Follow the steps below to set up OAuth2 authentication with HolySheets.

## 1. Configuring OAuth2 Credentials in Google Cloud Console

To enable HolySheets to access your Google Sheets securely, you need to configure OAuth2 credentials in the Google Cloud Console.

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

4. **Configure OAuth Consent Screen:**

   - In the left sidebar, navigate to **"APIs & Services" > "OAuth consent screen"**.
   - Choose **"External"** and click **"Create"**.
   - Fill in the required details:
     - **App Name:** e.g., `HolySheets Documentation`.
     - **User Support Email:** Your email address.
     - **Developer Contact Information:** Your email address.
   - Click **"Save and Continue"**.
   - **Add Scopes:**
     - Click **"Add or Remove Scopes"**.
     - Add the following scope:
       ```
       https://www.googleapis.com/auth/spreadsheets
       ```
     - Click **"Update"** and then **"Save and Continue"**.
   - **Add Test Users:**
     - In the **"Test users"** section, add your Google account email (e.g., `youremail@emailprovider.com`).
     - Click **"Save and Continue"**.
   - **Finalize Configuration:**
     - Skip the optional sections and click **"Save and Continue"** until you finish.

5. **Create OAuth2 Credentials:**

   - From the left sidebar, go to **"APIs & Services" > "Credentials"**.
   - Click **"Create Credentials"** > **"OAuth client ID"**.
   - Select **"Web application"** as the application type.
   - **Name:** e.g., `HolySheets OAuth Client`.
   - **Authorized Redirect URIs:**
     ```
     https://developers.google.com/oauthplayground
     ```
   - Click **"Create"**.
   - **Retrieve Credentials:**
     - After creation, a dialog will display your **Client ID** and **Client Secret**.
     - **Copy** these values securely; you'll need them for your project.

## 2. Obtaining a Refresh Token

A **refresh token** allows your application to obtain new access tokens without user intervention. Follow these steps to obtain a refresh token using the **OAuth 2.0 Playground**.

1. **Access OAuth 2.0 Playground:**

   - Navigate to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).

2. **Configure to Use Your Own OAuth Credentials:**

   - Click the **gear icon (⚙️)** in the top-right corner.
   - Check **"Use your own OAuth credentials"**.
   - Enter your **Client ID** and **Client Secret** obtained earlier.
   - Click **"Close"**.

3. **Select Scopes:**

   - In **"Step 1"**, input the following scope:
     ```
     https://www.googleapis.com/auth/spreadsheets
     ```
   - Click **"Authorize APIs"**.

4. **Authorize Access:**

   - Log in with your Google account (`youremail@emailprovider.com`).
   - Grant the requested permissions.

5. **Exchange Authorization Code for Tokens:**

   - In **"Step 2"**, click **"Exchange authorization code for tokens"**.
   - You will receive an **Access Token** and a **Refresh Token**.
   - **Copy the Refresh Token** and keep it secure; you'll need it for your project.

## 3. Integrating OAuth2 with HolySheets

With your OAuth2 credentials and refresh token obtained, integrate OAuth2 authentication into your existing HolySheets project.

### 3.1. Initializing the OAuth2 Client

Create a file named `auth.ts` in your project's `src` directory to handle OAuth2 client initialization.

```typescript
// src/auth.ts
import { google } from 'googleapis'

const clientId = 'YOUR_CLIENT_ID_HERE'
const clientSecret = 'YOUR_CLIENT_SECRET_HERE'
const redirectUri = 'https://developers.google.com/oauthplayground'
const refreshToken = 'YOUR_REFRESH_TOKEN_HERE'

/**
 * Initializes the OAuth2 client.
 *
 * @returns Configured OAuth2 client.
 */
export function initializeOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  )
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })
  return oauth2Client
}
```

**Note**: Replace 'YOUR_CLIENT_ID_HERE', 'YOUR_CLIENT_SECRET_HERE', and 'YOUR_REFRESH_TOKEN_HERE' with your actual credentials obtained from the previous steps.

### 3.2. Integrating HolySheets with OAuth2

Create or update your index.ts file in the src directory to set up HolySheets with the OAuth2 client.

```Typescript
// src/index.ts
import HolySheets from 'holysheets'
import { initializeOAuth2Client } from './auth'

const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE'

/**
 * Initializes the HolySheets instance with OAuth2 authentication.
 *
 * @returns An instance of HolySheets configured with OAuth2.
 */
async function initializeHolySheets() {
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID is not defined.')
  }

  const oauth2Client = initializeOAuth2Client()

  const sheets = new HolySheets({
    spreadsheetId,
    auth: oauth2Client,
  })

  // Replace 'Sheet1' with the name of your sheet/tab
  const table = sheets.base<{ Name: string; Age: string }>('Sheet1')

  return table
}

export default initializeHolySheets
```

**Note**: Replace 'YOUR_SPREADSHEET_ID_HERE' with your actual Google Sheets ID.
