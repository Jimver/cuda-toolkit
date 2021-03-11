import {SemVer} from 'semver'
import {AbstractLinks} from './links/links'
import {debug} from '@actions/core'
import {getLinks} from './links/getLinks'

// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(versionString: string): Promise<SemVer> {
  const version = new SemVer(versionString)
  const links: AbstractLinks = await getLinks()
  debug(`At links: ${links}`)
  const versions = links.getAvailableCudaVersions()
  debug(`Available versions: ${versions}`)
  if (versions.find(v => v.compare(version) === 0) !== undefined) {
    debug(`Version available: ${version}`)
    return version
  } else {
    debug(`Version not available error!`)
    throw new Error(`Version not available: ${version}`)
  }
}
