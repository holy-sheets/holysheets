import { CliError } from '@/cli/errors/CliError'
import {
  ParsedReadFlags,
  ParsedSchemaFlagBlock,
  ParsedWhereFlagBlock
} from '@/cli/types'

const VALUE_FLAGS = new Set([
  '--config',
  '--spreadsheet-id',
  '--sheet',
  '--header-row',
  '--format',
  '--output',
  '--select',
  '--omit',
  '--schema-file',
  '--schema-json',
  '--schema-field',
  '--schema-type',
  '--schema-alias',
  '--where-field',
  '--where-op',
  '--where-value'
])

const BOOLEAN_FLAGS = new Set([
  '--pretty',
  '--schema-nullable',
  '--skip-sheet-validation'
])

const ALL_FLAGS = new Set([...VALUE_FLAGS, ...BOOLEAN_FLAGS])

type ParsedFlag = {
  name: string
  inlineValue?: string
}

function parseFlagToken(token: string): ParsedFlag {
  if (!token.startsWith('--')) {
    throw new CliError(`Unexpected positional argument "${token}".`)
  }

  const equalIndex = token.indexOf('=')
  if (equalIndex === -1) {
    return { name: token }
  }

  const name = token.slice(0, equalIndex)
  const inlineValue = token.slice(equalIndex + 1)
  return { name, inlineValue }
}

function readFlagValue(
  args: string[],
  currentIndex: number,
  inlineValue?: string
): { value: string; nextIndex: number } {
  if (inlineValue !== undefined) {
    return { value: inlineValue, nextIndex: currentIndex }
  }

  const nextIndex = currentIndex + 1
  const next = args[nextIndex]
  if (!next || next.startsWith('--')) {
    throw new CliError(`Missing value for "${args[currentIndex]}".`)
  }

  return { value: next, nextIndex }
}

export function parseReadFlags(args: string[]): ParsedReadFlags {
  const parsed: ParsedReadFlags = {
    skipSheetValidation: false,
    pretty: false,
    select: [],
    omit: [],
    schemaBlocks: [],
    whereBlocks: []
  }

  let currentSchemaBlock: ParsedSchemaFlagBlock | null = null
  let currentWhereBlock: ParsedWhereFlagBlock | null = null

  const commitSchemaBlock = () => {
    if (currentSchemaBlock) {
      parsed.schemaBlocks.push(currentSchemaBlock)
      currentSchemaBlock = null
    }
  }

  const commitWhereBlock = () => {
    if (currentWhereBlock) {
      parsed.whereBlocks.push(currentWhereBlock)
      currentWhereBlock = null
    }
  }

  for (let index = 0; index < args.length; index++) {
    const token = args[index]
    const { name, inlineValue } = parseFlagToken(token)

    if (!ALL_FLAGS.has(name)) {
      throw new CliError(
        `Unknown option "${name}". Use --help to list options.`
      )
    }

    if (BOOLEAN_FLAGS.has(name)) {
      if (inlineValue !== undefined) {
        throw new CliError(`Option "${name}" does not accept a value.`)
      }

      if (name === '--pretty') {
        parsed.pretty = true
      }

      if (name === '--skip-sheet-validation') {
        parsed.skipSheetValidation = true
      }

      if (name === '--schema-nullable') {
        if (!currentSchemaBlock) {
          throw new CliError(
            'Flag "--schema-nullable" must be used after "--schema-field".'
          )
        }
        currentSchemaBlock.nullable = true
      }
      continue
    }

    const { value, nextIndex } = readFlagValue(args, index, inlineValue)
    index = nextIndex

    switch (name) {
      case '--config':
        parsed.config = value
        break
      case '--spreadsheet-id':
        parsed.spreadsheetId = value
        break
      case '--sheet':
        parsed.sheet = value
        break
      case '--header-row':
        parsed.headerRow = value
        break
      case '--format':
        parsed.format = value
        break
      case '--output':
        parsed.output = value
        break
      case '--select':
        parsed.select.push(value)
        break
      case '--omit':
        parsed.omit.push(value)
        break
      case '--schema-file':
        parsed.schemaFile = value
        break
      case '--schema-json':
        parsed.schemaJson = value
        break
      case '--schema-field':
        commitSchemaBlock()
        currentSchemaBlock = { field: value }
        break
      case '--schema-type':
        if (!currentSchemaBlock) {
          throw new CliError(
            'Flag "--schema-type" must be used after "--schema-field".'
          )
        }
        if (currentSchemaBlock.type) {
          throw new CliError(
            `Schema field "${currentSchemaBlock.field}" already has a type.`
          )
        }
        currentSchemaBlock.type = value
        break
      case '--schema-alias':
        if (!currentSchemaBlock) {
          throw new CliError(
            'Flag "--schema-alias" must be used after "--schema-field".'
          )
        }
        if (currentSchemaBlock.alias) {
          throw new CliError(
            `Schema field "${currentSchemaBlock.field}" already has an alias.`
          )
        }
        currentSchemaBlock.alias = value
        break
      case '--where-field':
        commitWhereBlock()
        currentWhereBlock = { field: value, values: [] }
        break
      case '--where-op':
        if (!currentWhereBlock) {
          throw new CliError(
            'Flag "--where-op" must be used after "--where-field".'
          )
        }
        if (currentWhereBlock.op) {
          throw new CliError(
            `Filter for field "${currentWhereBlock.field}" already has an operator.`
          )
        }
        currentWhereBlock.op = value
        break
      case '--where-value':
        if (!currentWhereBlock) {
          throw new CliError(
            'Flag "--where-value" must be used after "--where-field".'
          )
        }
        currentWhereBlock.values.push(value)
        break
    }
  }

  commitSchemaBlock()
  commitWhereBlock()

  return parsed
}
