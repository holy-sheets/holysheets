import { CAC, Command, cac } from 'cac'

import packageJson from '../../package.json'
import { runReadCommand } from '@/cli/commands/runReadCommand'
import { readCliConfig } from '@/cli/config/readCliConfig'
import { CliError } from '@/cli/errors/CliError'
import { normalizeReadCommand } from '@/cli/normalize/normalizeReadCommand'
import { serializeOutput } from '@/cli/output/serializeOutput'
import { writeOutput } from '@/cli/output/writeOutput'
import { parseReadFlags } from '@/cli/parse/parseReadFlags'
import { ReadOperation } from '@/cli/types'

function handleCliError(error: unknown) {
  if (error instanceof CliError) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = error.exitCode
    return
  }

  if (error instanceof Error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
    return
  }

  process.stderr.write('Unexpected CLI error.\n')
  process.exitCode = 1
}

function readTailArgs(
  argv: string[],
  commandTokens: readonly string[]
): string[] {
  return argv.slice(commandTokens.length)
}

const READ_OPERATIONS: ReadOperation[] = [
  'find-many',
  'find-first',
  'find-unique',
  'find-last',
  'find-many-or-throw',
  'find-first-or-throw',
  'find-unique-or-throw',
  'find-last-or-throw',
  'describe'
]

function isReadOperation(operation: string): operation is ReadOperation {
  return READ_OPERATIONS.includes(operation as ReadOperation)
}

function toReadOperation(operation: string): ReadOperation {
  if (!isReadOperation(operation)) {
    throw new CliError(
      `Invalid read command "${operation}". Allowed commands: ${READ_OPERATIONS.join(', ')}.`
    )
  }
  return operation
}

function addReadOptions(command: Command): Command {
  return command
    .option('--config <path>', 'Path to a JSON config file')
    .option('--spreadsheet-id <id>', 'Google Spreadsheet ID')
    .option('--sheet <name>', 'Sheet name')
    .option('--header-row <number>', 'Header row number (default: 1)')
    .option('--format <json|csv|ndjson>', 'Output format (default: json)')
    .option('--output <path>', 'Write output to file instead of stdout')
    .option('--pretty', 'Pretty-print JSON output')
    .option('--schema-file <path>', 'Schema JSON file')
    .option('--schema-json <json>', 'Schema JSON string')
    .option('--schema-field <name>', 'Schema field name (repeatable)')
    .option('--schema-type <type>', 'Schema field type')
    .option('--schema-nullable', 'Mark current schema field as nullable')
    .option('--schema-alias <name>', 'Alias for current schema field')
    .option('--where-field <field>', 'Where field (repeatable block)')
    .option(
      '--where-op <op>',
      'Where operator (equals, not, in, notIn, lt, lte, gt, gte, contains, startsWith, endsWith, search)'
    )
    .option('--where-value <value>', 'Where value')
    .option('--select <field>', 'Select field (repeatable)')
    .option('--omit <field>', 'Omit field (repeatable)')
}

async function executeReadFromCli(
  argv: string[],
  commandTokens: readonly string[],
  operation: ReadOperation
) {
  try {
    const tailArgs = readTailArgs(argv, commandTokens)
    const flags = parseReadFlags(tailArgs)
    const config = readCliConfig(flags.config)
    const normalized = normalizeReadCommand({
      operation,
      flags,
      config
    })

    const result = await runReadCommand(normalized)
    const serialized = serializeOutput(normalized, result)
    writeOutput(serialized, normalized.output)
  } catch (error) {
    handleCliError(error)
  }
}

export function runCli(argv: string[]) {
  const cli: CAC = cac('holysheets')
  cli.version(packageJson.version)

  addReadOptions(
    cli.command(
      'read <operation>',
      'Read commands using default source (google-sheets)'
    )
  ).action((operation: string) => {
    const normalizedOperation = toReadOperation(operation)
    void executeReadFromCli(argv, ['read', operation], normalizedOperation)
  })

  addReadOptions(
    cli.command(
      'google-sheets <group> <operation>',
      'Read commands using explicit google-sheets source'
    )
  ).action((group: string, operation: string) => {
    if (group !== 'read') {
      handleCliError(
        new CliError(
          `Invalid command group "${group}" for source "google-sheets". Use "read".`
        )
      )
      return
    }
    const normalizedOperation = toReadOperation(operation)
    void executeReadFromCli(
      argv,
      ['google-sheets', group, operation],
      normalizedOperation
    )
  })

  cli.help()
  try {
    cli.parse(['node', 'holysheets', ...argv])
  } catch (error) {
    handleCliError(error)
  }
}
