import * as core from '@actions/core'
import { OSType, getOs } from './platform.js'
import { Method } from './method.js'
import { SemVer } from 'semver'
import { exec } from '@actions/exec'
import { execReturnOutput } from './run-command.js'
import { CPUArch, getArch } from './arch.js'

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

  // Dynamically determine architecture
  let arch = 'x86_64' // Default to x86_64
  try {
    if ((await getArch()) === CPUArch.arm64) {
      arch = 'sbsa' // This might not work in the future, they are merging arm64 and sbsa
    }
  } catch (error) {
    core.debug(`Error detecting architecture: ${error}`)
    core.warning(`Could not detect architecture, using default ${arch}`)
  }
  core.debug(
    `Detected architecture: ${process.arch}, using arch string: ${arch}`
  )

  const pinFilename = `cuda-ubuntu${ubuntuVersionNoDot}.pin`
  const pinUrl = `https://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/${arch}/${pinFilename}`
  const repoUrl = `http://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/${arch}/`
  const keyRingVersion = `1.1-1`
  const keyRingUrl = `https://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/${arch}/cuda-keyring_${keyRingVersion}_all.deb`
  const keyRingFilename = `cuda_keyring.deb`

  core.debug(`Pin filename: ${pinFilename}`)
  core.debug(`Pin url: ${pinUrl}`)
  core.debug(`Keyring url: ${keyRingUrl}`)

  core.debug(`Downloading keyring`)
  await exec(`wget ${keyRingUrl} -O ${keyRingFilename}`)
  await exec(`sudo dpkg -i ${keyRingFilename}`)

  core.debug('Adding CUDA Repository')
  await exec(`wget ${pinUrl}`)
  await exec(
    `sudo mv ${pinFilename} /etc/apt/preferences.d/cuda-repository-pin-600`
  )
  await exec(`sudo add-apt-repository "deb ${repoUrl} /"`)
  await exec(`sudo apt-get update`)
}

export async function aptInstall(
  version: SemVer,
  subPackages: string[],
  nonCudaSubPackages: string[]
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
    const prefixedSubPackages = subPackages.map(
      (subPackage) => `cuda-${subPackage}`
    )
    const versionedSubPackages = prefixedSubPackages
      .concat(nonCudaSubPackages)
      .map(
        (nonCudaSubPackage) =>
          `${nonCudaSubPackage}-${version.major}-${version.minor}`
      )
    core.debug(`Only install subpackages: ${versionedSubPackages}`)
    return await exec(`sudo apt-get -y install`, versionedSubPackages)
  }
}
