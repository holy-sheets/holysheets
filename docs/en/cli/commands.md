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
  --sheet places \
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
  --sheet places \
  --where-field name --where-op equals --where-value "Cafe Central"
```

Supported output formats: `json`, `ndjson`.

::: warning
`csv` format is not supported for `find-first`.
:::

---

## `read describe`

Returns metadata about the sheet, including detected columns and resolved schema. Does **not** return data rows.

```bash
holysheets read describe \
  --spreadsheet-id <ID> \
  --sheet places \
  --header-row 2
```

Example output:

```json
{
  "source": "google-sheets",
  "spreadsheetId": "abc123",
  "sheet": "places",
  "headerRow": 2,
  "columns": [
    { "index": 0, "name": "nome_estabelecimento" },
    { "index": 1, "name": "rating" }
  ],
  "schema": []
}
```

::: warning
`describe` does not accept `--where-*` or `--select` flags.
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

See [Configuration](./configuration.md) for details on config files and flag precedence.

See [Schema](./schema.md), [Filters](./filters-and-select.md), and [Output](./output.md) for more advanced usage.
