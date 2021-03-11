import {SemVer} from 'semver'
import {ILinks} from './links'

const cudaVersionStringToURLStringLinux = new Map([
  [
    '11.2.2',
    'https://developer.download.nvidia.com/compute/cuda/11.2.2/local_installers/cuda_11.2.2_460.32.03_linux.run'
  ],
  [
    '11.2.1',
    'https://developer.download.nvidia.com/compute/cuda/11.2.1/local_installers/cuda_11.2.1_460.32.03_linux.run'
  ],
  [
    '10.2.89',
    'https://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda_10.2.89_440.33.01_linux.run'
  ],
  [
    '9.2.148',
    'https://developer.nvidia.com/compute/cuda/9.2/Prod2/local_installers/cuda_9.2.148_396.37_linux'
  ],
  [
    '8.0.61',
    'https://developer.nvidia.com/compute/cuda/8.0/Prod2/local_installers/cuda_8.0.61_375.26_linux-run'
  ]
])

/**
 * Singleton class for windows links.
 */
export class LinuxLinks implements ILinks {
  // Singleton instance
  private static _instance: LinuxLinks

  // Map of cuda SemVer version to download URL
  private cudaVersionToURL = new Map(
    [...cudaVersionStringToURLStringLinux].map(([k, v]) => [
      new SemVer(k),
      new URL(v)
    ])
  )

  // Private constructor to prevent instantiation
  private constructor() {}

  static get Instance(): LinuxLinks {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }

  getAvailableCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToURL.keys())
  }

  getURLFromCudaVersion(version: SemVer): URL {
    const urlString = this.cudaVersionToURL.get(version)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return urlString
  }
}
