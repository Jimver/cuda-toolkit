import {SemVer} from 'semver'
import * as core from '@actions/core'
import {Method} from './method'
import {getOs, OSType} from './platform'
import {execReturnOutput} from './runCommand'
import {exec} from '@actions/exec'

export async function useApt(method: Method): Promise<boolean> {
  return method === 'network' && (await getOs()) === OSType.linux
}

export async function aptSetup(version: SemVer): Promise<void> {
  const osType = await getOs()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt setup can only be run on linux runners! Current os type: ${osType}`
    )
  }
  core.debug(`Setup packages for ${version}`)
  const ubuntuVersion: string = await execReturnOutput('lsb_release', ['-sr'])
  const ubuntuVersionNoDot = ubuntuVersion.replace('.', '')
  const pinFilename = `cuda-ubuntu${ubuntuVersionNoDot}.pin`
  const pinUrl = `https://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/x86_64/${pinFilename}`
  const aptKeyUrl = `"http://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/x86_64/7fa2af80.pub`
  const repoUrl = `http://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/x86_64/`

  core.debug(`Pin filename: ${pinFilename}`)
  core.debug(`Pin url: ${pinUrl}`)
  core.debug(`Apt key url: ${aptKeyUrl}`)

  core.debug('Adding CUDA Repository')
  await exec(`wget ${pinUrl}`)
  await exec(
    `sudo mv ${pinFilename} /etc/apt/preferences.d/cuda-repository-pin-600`
  )
  await exec(`sudo apt-key adv --fetch-keys ${aptKeyUrl}`)
  await exec(`sudo add-apt-repository "deb ${repoUrl} /"`)
  await exec(`sudo apt-get update`)
}

export async function aptInstall(
  version: SemVer,
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
    const packageName = `cuda-${version.major}-${version.minor}`
    core.debug(`Install package: ${packageName}`)
    return await exec(`sudo apt-get -y install`, [packageName])
  } else {
    // Only install specified packages
    const versionedSubPackages = subPackages.map(
      subPackage => `cuda-${subPackage}-${version.major}-${version.minor}`
    )
    core.debug(`Only install subpackages: ${versionedSubPackages}`)
    return await exec(`sudo apt-get -y install`, versionedSubPackages)
  }
}
