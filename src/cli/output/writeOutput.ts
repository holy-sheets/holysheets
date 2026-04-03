import fs from 'node:fs'
import path from 'node:path'

import { CliError } from '@/cli/errors/CliError'

export function writeOutput(content: string, outputPath?: string): void {
  if (!outputPath) {
    process.stdout.write(`${content}\n`)
    return
  }

  const resolvedPath = path.resolve(process.cwd(), outputPath)
  const directory = path.dirname(resolvedPath)

  try {
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(resolvedPath, content, 'utf8')
  } catch (error) {
    throw new CliError(
      `Could not write output file "${resolvedPath}": ${(error as Error).message}`
    )
  }
}
