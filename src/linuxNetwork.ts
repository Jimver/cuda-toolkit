import {SemVer} from 'semver'
import * as core from '@actions/core'

export async function aptSetup(version: SemVer): Promise<string> {
  core.debug(`Setup packages for ${version}`)
  return 'cuda'
}

export async function aptInstall(packageName: string): Promise<number> {
  core.debug(`Install package: ${packageName}`)
  return 0
}
