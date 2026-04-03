# CLI Complete Guide

This page is a single, end-to-end reference for HolySheets CLI public read mode.

HolySheets CLI supports two equivalent command shapes:

```bash
# implicit source (default = google-sheets)
holysheets read <operation> [flags]

# explicit source
holysheets google-sheets read <operation> [flags]
```

## Quickstart (Pokemon Public Sheet)

You can test with this public spreadsheet:

- Spreadsheet ID: `1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY`
- Tabs: `pokemon`, `moves`

```bash
holysheets read describe \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon
```

## Supported Operations

- `find-many`
- `find-first`
- `find-unique`
- `find-last`
- `find-many-or-throw`
- `find-first-or-throw`
- `find-unique-or-throw`
- `find-last-or-throw`
- `describe`

## Common Flags

| Flag                      | Description | Default |
| ------------------------- | ----------- | ------- |
| `--config <path>` | Path to JSON config file | - |
| `--spreadsheet-id <id>` | Google Spreadsheet ID | - |
| `--sheet <name>` | Sheet/tab name | - |
| `--header-row <number>` | Header row index (1-based) | `1` |
| `--skip-sheet-validation` | Skip public sheet-name validation (escape hatch) | `false` |
| `--format <json\|csv\|ndjson>` | Output serialization format | `json` |
| `--output <path>` | Write output to file | stdout |
| `--pretty` | Pretty-print JSON | `false` |
| `--select <field>` | Include only selected fields (repeatable) | all |
| `--omit <field>` | Exclude fields (repeatable) | none |

Important:

- `--select` and `--omit` cannot be used together.
- `--skip-sheet-validation` is faster but less safe. With invalid `--sheet`, Google public endpoints may silently fallback.

## Schema

You can pass schema in exactly one source:

1. `--schema-file <path>`
2. `--schema-json <json-string>`
3. Repeatable schema flags

Supported schema types are:

- `string`
- `number`
- `boolean`
- `date`

### Schema via file

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves \
  --schema-file ./schema/moves.schema.json
```

### Schema via JSON string

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves \
  --schema-json '[{"key":"move_name","type":"string"},{"key":"power","type":"number"}]'
```

### Schema via explicit blocks

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves \
  --schema-field move_name --schema-type string \
  --schema-field power --schema-type number \
  --schema-field accuracy --schema-type number \
  --schema-field pp --schema-type number --schema-nullable
```

Block rule:

- Each `--schema-field` starts a new block.
- `--schema-type`, `--schema-nullable`, `--schema-alias` apply to the latest block.

## Where Filters

Supported operators:

- `equals`
- `not`
- `in`
- `notIn`
- `lt`
- `lte`
- `gt`
- `gte`
- `contains`
- `startsWith`
- `endsWith`
- `search`

### Single filter

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon \
  --where-field name --where-op contains --where-value saur
```

### Multiple filters (AND)

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves \
  --where-field type --where-op equals --where-value fire \
  --where-field power --where-op gte --where-value 80
```

Filter block rule:

- Each `--where-field` starts a new block.
- `--where-op` and `--where-value` apply to the latest block.

## Select and Omit

### Select

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon \
  --select name \
  --select types \
  --select attack
```

### Omit

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon \
  --omit description \
  --omit cry_url \
  --omit sprite_url
```

## Output

`--format` controls serialization. `--output` controls destination.

- No `--output`: prints to stdout
- With `--output`: writes to file

### JSON to file

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon \
  --format json \
  --pretty \
  --output ./out/pokemon.json
```

### CSV export

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves \
  --format csv \
  --output ./out/moves.csv
```

### NDJSON export

```bash
holysheets read find-many \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet pokemon \
  --format ndjson \
  --output ./out/pokemon.ndjson
```

Note:

- `csv` is supported for list operations (`find-many` / `find-many-or-throw`).

## Describe

`describe` returns metadata and does not return row data.

```bash
holysheets read describe \
  --spreadsheet-id 1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY \
  --sheet moves
```

For `describe`:

- `--where-*` is not allowed
- `--select` is not allowed
- `--omit` is not allowed
- `--format csv` is not allowed

## Config File

Example `holysheets.config.json`:

```json
{
  "defaults": {
    "spreadsheetId": "1E0NPuF242etl5WaEa1A5W90I2NjY5WSBE_0eSkHrZbY",
    "sheet": "pokemon",
    "headerRow": 1,
    "skipSheetValidation": false,
    "format": "json",
    "pretty": false
  }
}
```

Usage:

```bash
holysheets read find-first \
  --config ./holysheets.config.json \
  --where-field name --where-op equals --where-value pikachu
```

Precedence:

`CLI flags > config.defaults > internal defaults`

## Error Examples

- Invalid command: unknown operation for `read`
- Missing required: `--spreadsheet-id`, `--sheet`
- Invalid `--where-op`
- Invalid/partial schema blocks
- Config file not found or invalid JSON
- Schema file not found or invalid JSON
- Invalid `--format` for operation (for example, `describe` + `csv`)

## Related Pages

- [Overview](./overview.md)
- [Commands](./commands.md)
- [Configuration](./configuration.md)
- [Schema](./schema.md)
- [Filters and Select](./filters-and-select.md)
- [Output](./output.md)
