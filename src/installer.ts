import {exec} from '@actions/exec'
import {SemVer} from 'semver'
import {download} from './downloader'
import * as core from '@actions/core'

export async function install(version: SemVer): Promise<void> {
  const executablePath: string = await download(version)
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }
  core.debug(`Running install executable: ${executablePath}`)
  const exitCode = await exec(executablePath, undefined, options)
  core.debug(`Installer exit code: ${exitCode}`)
}
