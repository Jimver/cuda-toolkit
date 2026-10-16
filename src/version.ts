import * as core from '@actions/core'
import { OSType, getOs } from './platform.js'
import { AbstractLinks } from './links/links.js'
import { Method } from './method.js'
import { SemVer } from 'semver'
import { WindowsLinks } from './links/windows-links.js'
import { getLinks } from './links/get-links.js'

// How loosely the input pins the version: a full semver string installs
// exactly that version, a major.minor pin floats across patches of that
// series, and a major-only pin floats across the whole major series.
type VersionPin = 'full' | 'major.minor' | 'major'

// Convert a version string to SemVer plus its pin level. Anything that is
// neither full semver nor a bare major(.minor) number is rejected.
function parseVersion(versionString: string): {
  version: SemVer
  pin: VersionPin
} {
  try {
    return { version: new SemVer(versionString), pin: 'full' }
  } catch {
    const match = versionString.trim().match(/^v?(\d+)(?:\.(\d+))?/)
    if (match === null) {
      throw new TypeError(`Invalid Version: ${versionString}`)
    }
    return {
      version: new SemVer(`${match[1]}.${match[2] ?? '0'}.0`),
      pin: match[2] === undefined ? 'major' : 'major.minor'
    }
  }
}

// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(
  versionString: string,
  method: Method
): Promise<SemVer> {
  const { version, pin } = parseVersion(versionString)
  const links: AbstractLinks = await getLinks()
  let versions
  switch (method) {
    case 'local':
      versions = links.getAvailableLocalCudaVersions()
      break
    case 'network':
      switch (await getOs()) {
        case OSType.linux:
          // TODO adapt this to actual available network versions for linux
          versions = links.getAvailableLocalCudaVersions()
          break
        case OSType.windows:
          versions = (
            links as unknown as WindowsLinks
          ).getAvailableNetworkCudaVersions()
          break
      }
  }
  core.debug(`Available versions: ${versions}`)
  if (pin !== 'full') {
    // A pin floats to the newest listed release it covers, matching how apt
    // resolves cuda-nvcc-<major>-<minor> on network installs.
    const newest = versions
      .filter(
        (v) =>
          v.major === version.major &&
          (pin === 'major' || v.minor === version.minor)
      )
      .reduce<
        SemVer | undefined
      >((newest, v) => (newest === undefined || v.compare(newest) > 0 ? v : newest), undefined)
    if (newest !== undefined) {
      core.debug(`Version pin ${version} resolves to: ${newest}`)
      return newest
    }
  } else if (versions.find((v) => v.compare(version) === 0) !== undefined) {
    core.debug(`Version available: ${version}`)
    return version
  }
  core.debug(`Version not available error!`)
  throw new Error(`Version not available: ${version}`)
}
