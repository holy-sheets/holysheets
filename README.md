# HollySheets

HollySheets is a TypeScript library that simplifies the process of interacting with Google Sheets API. It provides a set of tools to read and write data from and to Google Sheets.

## Features

- Easy to use API for interacting with Google Sheets.
- Supports reading and writing data.
- Supports authentication with Google Sheets API.

## Installation

You can install HollySheets using npm:

```bash
npm install hollysheets
```

## Usage

To use `HollySheets` in your TypeScript project, you need to import it and initialize it with your Google Sheets credentials. Here's an example:

## Limitations

While HollySheets provides a convenient way to interact with Google Sheets, it may not be suitable for all projects. Specifically, it may not be the best choice for:

- Projects with large amounts of data: Google Sheets has requests limits and performance can degrade with very large sheets. If your project involves handling large datasets, a dedicated database system may be more appropriate.

- Projects that require advanced database features: Google Sheets is a spreadsheet tool and lacks many features of dedicated database systems. For example, it does not support table constraints like a SQL database would. If your project requires these features, consider using a dedicated database system.