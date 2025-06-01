import * as core from '@actions/core'
import { exec } from '@actions/exec'

export async function execReturnOutput(
  command: string,
  args: string[] = []
): Promise<string> {
  let result = ''
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        result += data.toString()
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }
  const exitCode = await exec(command, args, execOptions)
  if (exitCode) {
    core.debug(`Error executing: ${command}. Exit code: ${exitCode}`)
  }
  return result.trim()
}
