# CLI Commands

All CLI commands operate in **public read-only mode**. They can be invoked using either the implicit or explicit source form:

```bash
holysheets read <operation> [flags]
holysheets google-sheets read <operation> [flags]
```

---

## `read find-many`

Returns all records matching the given filters.

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field rating --where-op gte --where-value 4 \
  --format json
```

Supports all output formats: `json`, `csv`, `ndjson`.

---

## `read find-first`

Returns the first record matching the filters, or `null` if none is found.

```bash
holysheets read find-first \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field name --where-op equals --where-value "Cafe Central"
```

---

## `read find-unique`

Returns a single record matching the filters, or `null` if none is found. Throws an error if **more than one** record matches.

```bash
holysheets read find-unique \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field id --where-op equals --where-value "42"
```

::: warning
If multiple records match the filters, the command will exit with an error.
:::

---

## `read find-last`

Returns the last record matching the filters, or `null` if none is found.

```bash
holysheets read find-last \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field city --where-op equals --where-value "São Paulo"
```

---

## `read find-many-or-throw`

Same as `find-many`, but exits with an error if **no records** are found.

```bash
holysheets read find-many-or-throw \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field rating --where-op gte --where-value 4
```

Supports all output formats: `json`, `csv`, `ndjson`.

---

## `read find-first-or-throw`

Same as `find-first`, but exits with an error if **no records** are found.

```bash
holysheets read find-first-or-throw \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field name --where-op equals --where-value "Cafe Central"
```

---

## `read find-unique-or-throw`

Same as `find-unique`, but exits with an error if **no records** are found or if **multiple records** match.

```bash
holysheets read find-unique-or-throw \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field id --where-op equals --where-value "42"
```

---

## `read find-last-or-throw`

Same as `find-last`, but exits with an error if **no records** are found.

```bash
holysheets read find-last-or-throw \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field city --where-op equals --where-value "São Paulo"
```

---

## `read describe`

Returns metadata about the sheet, including detected columns and resolved schema. Does **not** return data rows.

```bash
holysheets read describe \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --header-row 2
```

Example output:

```json
{
  "source": "google-sheets",
  "spreadsheetId": "abc123",
  "sheet": "<sheet-name>",
  "headerRow": 2,
  "columns": [
    { "index": 0, "name": "nome_estabelecimento" },
    { "index": 1, "name": "rating" }
  ],
  "schema": []
}
```

::: warning
`describe` does not accept `--where-*`, `--select`, or `--omit` flags.
:::

---

## Common Flags

All read commands accept the following flags:

| Flag               | Description                             | Default    |
| ------------------ | --------------------------------------- | ---------- |
| `--spreadsheet-id` | Google Spreadsheet ID (**required**)    | —          |
| `--sheet`          | Sheet name (**required**)               | —          |
| `--config`         | Path to a JSON config file              | —          |
| `--header-row`     | Header row number                       | `1`        |
| `--format`         | Output format (`json`, `csv`, `ndjson`) | `json`     |
| `--output`         | Write output to file                    | stdout     |
| `--pretty`         | Pretty-print JSON output                | `false`    |
| `--select`         | Select specific fields (repeatable)     | all fields |
| `--omit`           | Omit specific fields (repeatable)       | none       |

See [Configuration](./configuration.md) for details on config files and flag precedence.

See [Schema](./schema.md), [Filters](./filters-and-select.md), and [Output](./output.md) for more advanced usage.
