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

| Operation    | `json` | `ndjson` | `csv` |
| ------------ | :----: | :------: | :---: |
| `find-many`  |   ✅   |    ✅    |  ✅   |
| `find-first` |   ✅   |    ✅    |  ❌   |
| `describe`   |   ✅   |    ✅    |  ❌   |

::: warning
`csv` is only supported for `find-many` in this version. Using it with other commands will produce an error.
:::

---

## Pretty Print

Use `--pretty` to format JSON output with indentation:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
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
  --sheet places \
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
  --sheet places \
  --format json \
  --pretty \
  --output ./out/places.json
```

Stream as NDJSON (useful for piping):

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --format ndjson | jq '.name'
```

Export filtered data as CSV:

```bash
holysheets read find-many \
  --spreadsheet-id <ID> \
  --sheet places \
  --where-field rating --where-op gte --where-value 4 \
  --format csv \
  --output ./out/top-places.csv
```
