import {AbstractLinks} from './links'

/**
 * Singleton class for windows links.
 */
export class LinuxArmLinks extends AbstractLinks {
  // Singleton instance
  private static _instance: LinuxArmLinks

  // Private constructor to prevent instantiation
  private constructor() {
    super()
    // Map of cuda SemVer version to download URL
    this.cudaVersionToURL = new Map([
      [
        '12.8.0',
        'https://developer.download.nvidia.com/compute/cuda/12.8.0/local_installers/cuda_12.8.0_570.86.10_linux_sbsa.run'
      ]
    ])
  }

  static get Instance(): LinuxArmLinks {
    return this._instance || (this._instance = new this())
  }
}
