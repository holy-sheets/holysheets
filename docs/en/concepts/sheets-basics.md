# Sheets Basics

A Google Spreadsheet contains multiple sheets (tabs). HolySheets operates on a specific sheet at a time via `base('SheetName')`.

- Each sheet is treated as a "table".
- The first row is considered the header row.
- HolySheets reads these headers to understand your columns.
