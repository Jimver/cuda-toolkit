import {SemVer} from 'semver'
import * as core from '@actions/core'
import {Method} from './method'
import {getOs, OSType} from './platform'

export async function useApt(method: Method): Promise<boolean> {
  return method === 'network' && (await getOs()) === OSType.linux
}

export async function aptSetup(version: SemVer): Promise<string> {
  const osType = await getOs()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt setup can only be run on linux runners! Current os type: ${osType}`
    )
  }
  core.debug(`Setup packages for ${version}`)
  // UBUNTU_VERSION = $(lsb_release - sr)
  // UBUNTU_VERSION = '${UBUNTU_VERSION//.}'
  // const pinFilename = `cuda-ubuntu${UBUNTU_VERSION}.pin`
  return 'cuda'
}

export async function aptInstall(
  packageName: string,
  subPackages: string[]
): Promise<number> {
  const osType = await getOs()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt install can only be run on linux runners! Current os type: ${osType}`
    )
  }
  if (subPackages.length === 0) {
    // Install everything
    core.debug(`Install package: ${packageName}`)
  } else {
    // Only install specified packages
    core.debug(`Only install subpackages: ${subPackages}`)
  }
  return 0
}
