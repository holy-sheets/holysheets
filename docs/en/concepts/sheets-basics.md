# Sheets Basics

A Google Spreadsheet contains multiple sheets (tabs). **HolySheets!** operates on a specific sheet at a time via `base('SheetName')`.

- **Each sheet is treated as a "table".**
- **The first row is considered the header row.**
- **HolySheets reads these headers to understand your columns.**

## Google Sheets Structure

To utilize **HolySheets!** effectively, it's essential to organize your Google Spreadsheet in a structured manner. Below are the key aspects of how **HolySheets!** interacts with your spreadsheet.

## Sheets as Tables

Each tab (sheet) in your Google Spreadsheet is considered a separate table within **HolySheets!**. You can interact with these tables using the `base` method.

#### Using the `base` Method

To interact with a specific sheet, initialize **HolySheets** and select the desired sheet using the `base` method:

```typescript
import Holysheets from 'holysheets'

// Initialize Holysheets with your Spreadsheet ID and authentication
const sheets = new Holysheets({
  spreadsheetId: 'your-spreadsheet-id',
  auth: yourAuthInstance // OAuth2 or JWT instance
})

// Select the 'Tasks' sheet
const tasksTable = sheets.base('Tasks')
```

## Rows as Records

Each row in a sheet represents a unique record in the table. **HolySheets!** treats each row as an individual entry, allowing you to perform CRUD (Create, Read, Update, Delete) operations seamlessly.

## TypeScript Support

**HolySheets!** offers robust TypeScript support, enabling you to associate column names with property keys in your TypeScript interfaces. This ensures type safety and enhances developer experience.

## Defining Interfaces

Define interfaces that map to your sheet's columns:

```Typescript
interface Task {
  taskId: number;
  title: string;
  assignedTo: string;
  status: string;
  dueDate: string;
}

const tasksTable = sheets.base<Task>('Tasks');
```

## Example Spreadsheet Structure

Below is an example of how your Google Spreadsheet should be structured for optimal use with **HolySheets!**.

### Tasks Sheet

|     | A           | B                   | C               | D           | E            |
| --- | ----------- | ------------------- | --------------- | ----------- | ------------ |
| 1   | **Task ID** | **Title**           | **Assigned To** | **Status**  | **Due Date** |
| 2   | 1           | Design Homepage     | Alice           | In Progress | 2024-05-10   |
| 3   | 2           | Develop API         | Bob             | Pending     | 2024-05-15   |
| 4   | 3           | Write Documentation | Charlie         | Completed   | 2024-04-25   |

### Team Members Sheet

|     | A             | B        | C                 | D                   |
| --- | ------------- | -------- | ----------------- | ------------------- |
| 1   | **Member ID** | **Name** | **Role**          | **Email**           |
| 2   | 1             | Alice    | Designer          | alice@example.com   |
| 3   | 2             | Bob      | Backend Developer | bob@example.com     |
| 4   | 3             | Charlie  | Technical Writer  | charlie@example.com |

### Projects Sheet

|     | A              | B                 | C              | D            | E          |
| --- | -------------- | ----------------- | -------------- | ------------ | ---------- |
| 1   | **Project ID** | **Project Name**  | **Start Date** | **End Date** | **Status** |
| 2   | 101            | Website Redesign  | 2024-04-01     | 2024-06-30   | Ongoing    |
| 3   | 102            | Mobile App Launch | 2024-05-15     | 2024-09-15   | Planning   |
| 4   | 103            | API Integration   | 2024-03-20     | 2024-07-20   | Completed  |

## API Access Limits

When interacting with the Google Sheets API through **HolySheets!**, it's important to be aware of the usage limits imposed by Google to ensure smooth and uninterrupted operations.

## Google Sheets API Quotas

- **Requests per 100 Seconds per User:** 100
- **Requests per 100 Seconds per Project:** 100
- **Requests per Minute per User:** 60

Exceeding these limits may result in your requests being throttled or temporarily blocked. To manage your usage effectively:

- **Batch Requests:** Combine multiple operations into a single request where possible.
- **Implement Retries:** Incorporate exponential backoff strategies to handle rate limiting gracefully.
- **Monitor Usage:** Regularly check your Google Cloud Console to monitor your API usage and adjust your application's behavior accordingly.

For detailed and up-to-date information, refer to the [Google Sheets API Quotas](https://developers.google.com/sheets/api/limits).

## Best Practices

Adhering to best practices ensures that your integration with **HolySheets** is efficient, reliable, and maintainable.

- **Consistent Headers:** Ensure that the first row of your spreadsheet contains clear and consistent headers. **HolySheets** relies on these headers to map the data correctly.
- **Data Types:** Maintain consistent data types within each column to avoid unexpected behavior during data operations.
- **Unique Identifiers:** Use unique identifiers (such as `Task ID`) for each row to simplify update and delete operations.
- **Organize Sheets:** Structure your spreadsheet logically, separating different types of data into distinct sheets (e.g., Tasks, Team Members, Projects).

## Important Considerations

While **HolySheets!** offers a powerful way to interact with Google Sheets as if they were traditional databases, there are important considerations to keep in mind:

- **Not a Replacement for a Real Database:** Google Sheets is not designed to handle large-scale data operations like a dedicated database system. **HolySheets** is ideal for lightweight applications and scenarios where real-time collaboration is essential, but it may be significantly slower and less reliable for high-volume or mission-critical applications.
- **Performance Limitations:** Due to the inherent limitations of Google Sheets and the API access quotas, performance may degrade with large datasets or frequent read/write operations.
- **Data Integrity:** While **HolySheets** facilitates data manipulation, ensuring data integrity and handling concurrent modifications require careful implementation.
- **Security:** Manage your authentication credentials securely. Ensure that only authorized users and services have access to your spreadsheets to protect sensitive data.

By understanding these limitations, you can make informed decisions about when and how to use **HolySheets!** effectively within your projects.

**Happy Coding!** 🚀
