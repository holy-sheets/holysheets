# CLI Output

Control how the CLI formats and delivers results using `--format`, `--output`, and `--pretty`.

---

## Output Formats

| Format   | Description             |
| -------- | ----------------------- |
| `json`   | Standard JSON (default) |
| `ndjson` | Newline-delimited JSON  |
| `csv`    | Comma-separated values  |

### Format Compatibility

| Operation              | `json` | `ndjson` | `csv` |
| ---------------------- | :----: | :------: | :---: |
| `find-many`            |   ✅   |    ✅    |  ✅   |
| `find-many-or-throw`   |   ✅   |    ✅    |  ✅   |
| `find-first`           |   ✅   |    ✅    |  ✅   |
| `find-unique`          |   ✅   |    ✅    |  ✅   |
| `find-last`            |   ✅   |    ✅    |  ✅   |
| `find-first-or-throw`  |   ✅   |    ✅    |  ✅   |
| `find-unique-or-throw` |   ✅   |    ✅    |  ✅   |
| `find-last-or-throw`   |   ✅   |    ✅    |  ✅   |
| `describe`             |   ✅   |    ✅    |  ❌   |

::: tip
`csv` works with all find operations. Single-record operations output a header row plus one data row. Only `describe` does not support CSV.
:::

---

## Pretty Print

Use `--pretty` to format JSON output with indentation:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --format json \
  --pretty
```

```json
[
  {
    "name": "Cafe Central",
    "rating": "4.5"
  }
]
```

Without `--pretty`:

```json
[{ "name": "Cafe Central", "rating": "4.5" }]
```

`--pretty` has no effect on `csv` or `ndjson` formats.

---

## Writing to File

By default, output is printed to **stdout**. Use `--output` to write to a file instead:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --format csv \
  --output ./out/places.csv
```

The directory will be created automatically if it does not exist.

---

## Examples

Export all records as JSON to a file:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --format json \
  --pretty \
  --output ./out/places.json
```

Stream as NDJSON (useful for piping):

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --format ndjson | jq '.name'
```

Export filtered data as CSV:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet <sheet-name> \
  --where-field rating --where-op gte --where-value 4 \
  --format csv \
  --output ./out/top-places.csv
```
