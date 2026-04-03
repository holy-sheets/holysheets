# CLI Overview

HolySheets! includes a command-line interface focused on **public read operations** from Google Sheets. No authentication is required — your spreadsheet only needs to be publicly accessible.

---

## Installation

The CLI ships with the `holysheets` package. Install it globally or use `npx`:

::: code-group

```bash [npx]
npx holysheets read find-many --sheet places --spreadsheet-id <ID>
```

```bash [global install]
npm install -g holysheets
holysheets read find-many --sheet places --spreadsheet-id <ID>
```

:::

---

## Command Structure

The CLI supports two equivalent command forms:

```bash
# Implicit source (google-sheets is the default)
holysheets read <operation> [flags]

# Explicit source
holysheets google-sheets read <operation> [flags]
```

Both forms are functionally identical. The explicit form exists for future extensibility.

---

## Available Operations

| Operation    | Description                                  |
| ------------ | -------------------------------------------- |
| `find-many`  | Returns all records matching the filters.    |
| `find-first` | Returns the first matching record.           |
| `describe`   | Returns sheet metadata (columns and schema). |

---

## Quick Example

```bash
holysheets read find-many \
  --spreadsheet-id 1AbCDefGhIJkLMNOPQRS_TUVWXYZ \
  --sheet places \
  --where-field rating --where-op gte --where-value 4 \
  --select name \
  --select rating \
  --format json \
  --pretty
```

Output:

```json
[
  { "name": "Cafe Central", "rating": "4.5" },
  { "name": "Bar do Zé", "rating": "4.2" }
]
```

---

## Help

```bash
holysheets --help
holysheets read --help
```

---

## Prerequisites

Your Google Sheet must be accessible publicly. Either:

- **Publish** the spreadsheet via _File → Share → Publish to the web_, or
- **Share** it as _"Anyone with the link can view"_.

No service account, OAuth setup, or API key is required.
