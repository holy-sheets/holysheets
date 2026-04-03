import fs from 'node:fs'
import path from 'node:path'

import { CliError } from '@/cli/errors/CliError'
import { CliConfigFile } from '@/cli/types'

export function readCliConfig(configPath?: string): CliConfigFile {
  if (!configPath) {
    return {}
  }

  const resolvedPath = path.resolve(process.cwd(), configPath)

  if (!fs.existsSync(resolvedPath)) {
    throw new CliError(`Config file not found: ${resolvedPath}`)
  }

  let fileContent: string
  try {
    fileContent = fs.readFileSync(resolvedPath, 'utf8')
  } catch (error) {
    throw new CliError(
      `Could not read config file "${resolvedPath}": ${(error as Error).message}`
    )
  }

  try {
    const parsed = JSON.parse(fileContent) as CliConfigFile
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Expected a JSON object.')
    }
    return parsed
  } catch (error) {
    throw new CliError(
      `Invalid JSON in config file "${resolvedPath}": ${(error as Error).message}`
    )
  }
}
