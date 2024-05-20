# Getting Google Credentials

Follow these steps to create a project in Google, export the JSON credentials for usage, create a spreadsheet, and add the Google project user as an editor of the spreadsheet:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign in with your Google account.
2. Click on the project drop-down and select "New Project".
3. Enter a name for your project and click on the "Create" button.
4. Once the project is created, click on the project drop-down again and select your newly created project.
5. In the left navigation menu, click on "APIs & Services" and then select "Credentials".
6. Click on the "Create Credentials" button and choose "Service Account".
7. Enter a name for your service account, select the role as "Project" > "Editor", and click on the "Continue" button.
8. On the next screen, click on the "Create Key" button and select "JSON" as the key type. This will download the JSON credentials file to your computer.
9. Store the downloaded JSON credentials file in a secure location.

    :warning: **Important**: Never commit your Google JSON credentials to your version control system. These are sensitive files that should be kept out of your repository to prevent unauthorized access.

10. Now, go to [Google Sheets](https://sheets.google.com/) and sign in with your Google account.
11. Click on the "Blank" template to create a new spreadsheet.
12. Give your spreadsheet a name and click on the "Create" button.
13. In the top-right corner, click on the "Share" button.
14. In the "People" field, enter the email address of the Google project user (found in the JSON credentials file) and select the role as "Editor".
15. Click on the "Send" button to share the spreadsheet with the Google project user.

You have now created a project in Google, exported the JSON credentials, created a spreadsheet, and added the Google project user as an editor of the spreadsheet.