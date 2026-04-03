# CLI Configuration

The CLI supports a JSON config file to define default values for common flags. This is useful when working repeatedly with the same spreadsheet or sheet.

---

## Config File

Create a JSON file (e.g., `holysheets.config.json`):

```json
{
  "defaults": {
    "spreadsheetId": "1AbCDefGhIJkLMNOPQRS_TUVWXYZ",
    "sheet": "<sheet-name>",
    "headerRow": 2,
    "skipSheetValidation": false,
    "format": "json",
    "pretty": true
  }
}
```

Pass it to the CLI with `--config`:

```bash
holysheets read find-many --config holysheets.config.json
```

---

## Available Defaults

| Key             | Type      | Description           |
| --------------- | --------- | --------------------- |
| `spreadsheetId` | `string`  | Google Spreadsheet ID |
| `sheet`         | `string`  | Sheet name            |
| `headerRow`     | `number`  | Header row number     |
| `skipSheetValidation` | `boolean` | Skip pre-validation of sheet name |
| `format`        | `string`  | Output format         |
| `pretty`        | `boolean` | Pretty-print JSON     |

---

## Precedence

CLI flags always take priority over config file values:

```
CLI flags  >  Config file defaults  >  Internal defaults
```

For example, if your config file sets `"sheet": "<sheet-name>"` but you pass `--sheet cities`, the CLI will use `cities`.

---

## Required Options

`--spreadsheet-id` and `--sheet` are always required. They can be provided via CLI flags or config file defaults, but must be present in one of the two.

```bash
# Using config for defaults, override sheet via flag
holysheets read find-many --config holysheets.config.json --sheet cities
```
