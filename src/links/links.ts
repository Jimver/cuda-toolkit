import {SemVer} from 'semver'
import {getOs, OSType} from '../platform'
import {LinuxLinks} from './linuxLinks'
import {WindowsLinks} from './windowsLinks'

// Interface for getting cuda versions and corresponding download URLs
export interface ILinks {
  getAvailableCudaVersions(): SemVer[]
  getURLFromCudaVersion(version: SemVer): URL
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
