import {SemVer} from 'semver'
import {AbstractLinks} from './links/links'
import * as core from '@actions/core'
import {getLinks} from './links/getLinks'
import {Method} from './method'
import {getOs, OSType} from './platform'
import {WindowsLinks} from './links/windowsLinks'

// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(
  versionString: string,
  method: Method
): Promise<SemVer> {
  const version = new SemVer(versionString)
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
          versions = (links as WindowsLinks).getAvailableNetworkCudaVersions()
          break
      }
  }
  core.debug(`Available versions: ${versions}`)
  if (versions.find(v => v.compare(version) === 0) !== undefined) {
    core.debug(`Version available: ${version}`)
    return version
  } else {
    core.debug(`Version not available error!`)
    throw new Error(`Version not available: ${version}`)
  }
}
