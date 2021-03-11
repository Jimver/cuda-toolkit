import {SemVer} from 'semver'
import {getOs, OSType} from '../platform'
import {LinuxLinks} from './linuxLinks'
import {WindowsLinks} from './windowsLinks'

// Interface for getting cuda versions and corresponding download URLs
export abstract class ILinks {
  protected cudaVersionToURL: Map<string, string> = new Map()

  getAvailableCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToURL.keys()).map(s => new SemVer(s))
  }

  getURLFromCudaVersion(version: SemVer): URL {
    const urlString = this.cudaVersionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }
}

// Platform independent getter for ILinks interface
export async function getLinks(): Promise<ILinks> {
  const osType = await getOs()
  switch (osType) {
    case OSType.windows:
      return WindowsLinks.Instance
    case OSType.linux:
      return LinuxLinks.Instance
  }
}
