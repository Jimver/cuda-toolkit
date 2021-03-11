import {SemVer} from 'semver'
import {ILinks} from './links'

// 11.2.1   https://developer.download.nvidia.com/compute/cuda/11.2.1/local_installers/cuda_11.2.1_461.09_win10.exe
// 10.2     https://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda_10.2.89_441.22_win10.exe
// 9.2      https://developer.nvidia.com/compute/cuda/9.2/Prod2/local_installers2/cuda_9.2.148_win10
// 8.0 GA 2 https://developer.nvidia.com/compute/cuda/8.0/Prod2/local_installers/cuda_8.0.61_win10-exe

// # Dictionary of known cuda versions and thier download URLS, which do not follow a consistent pattern :(
// $CUDA_KNOWN_URLS = @{
//     "8.0.44" = "http://developer.nvidia.com/compute/cuda/8.0/Prod/network_installers/cuda_8.0.44_win10_network-exe";
//     "8.0.61" = "http://developer.nvidia.com/compute/cuda/8.0/Prod2/network_installers/cuda_8.0.61_win10_network-exe";
//     "9.0.176" = "http://developer.nvidia.com/compute/cuda/9.0/Prod/network_installers/cuda_9.0.176_win10_network-exe";
//     "9.1.85" = "http://developer.nvidia.com/compute/cuda/9.1/Prod/network_installers/cuda_9.1.85_win10_network";
//     "9.2.148" = "http://developer.nvidia.com/compute/cuda/9.2/Prod2/network_installers2/cuda_9.2.148_win10_network";
//     "10.0.130" = "http://developer.nvidia.com/compute/cuda/10.0/Prod/network_installers/cuda_10.0.130_win10_network";
//     "10.1.105" = "http://developer.nvidia.com/compute/cuda/10.1/Prod/network_installers/cuda_10.1.105_win10_network.exe";
//     "10.1.168" = "http://developer.nvidia.com/compute/cuda/10.1/Prod/network_installers/cuda_10.1.168_win10_network.exe";
//     "10.1.243" = "http://developer.download.nvidia.com/compute/cuda/10.1/Prod/network_installers/cuda_10.1.243_win10_network.exe";
//     "10.2.89" = "http://developer.download.nvidia.com/compute/cuda/10.2/Prod/network_installers/cuda_10.2.89_win10_network.exe";
//     "11.0.167" = "http://developer.download.nvidia.com/compute/cuda/11.0.1/network_installers/cuda_11.0.1_win10_network.exe"
// }

const cudaVersionStringToURLStringWindows = new Map([
  [
    '11.2.2',
    'https://developer.download.nvidia.com/compute/cuda/11.2.2/local_installers/cuda_11.2.2_461.33_win10.exe'
  ],
  [
    '11.2.1',
    'https://developer.download.nvidia.com/compute/cuda/11.2.1/local_installers/cuda_11.2.1_461.09_win10.exe'
  ],
  [
    '10.2.89',
    'https://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda_10.2.89_441.22_win10.exe'
  ],
  [
    '9.2.148',
    'https://developer.nvidia.com/compute/cuda/9.2/Prod2/local_installers2/cuda_9.2.148_win10'
  ],
  [
    '8.0.61',
    'https://developer.nvidia.com/compute/cuda/8.0/Prod2/local_installers/cuda_8.0.61_win10-exe'
  ]
])

/**
 * Singleton class for windows links.
 */
export class WindowsLinks implements ILinks {
  // Singleton instance
  private static _instance: WindowsLinks

  // Map of cuda SemVer version to download URL
  private cudaVersionToURL = new Map(
    [...cudaVersionStringToURLStringWindows].map(([k, v]) => [
      new SemVer(k),
      new URL(v)
    ])
  )

  // Private constructor to prevent instantiation
  private constructor() {}

  static get Instance(): WindowsLinks {
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
