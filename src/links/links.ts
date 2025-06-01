import { SemVer } from 'semver'

// Interface for getting cuda versions and corresponding download URLs
export abstract class AbstractLinks {
  protected cudaVersionToURL: Map<string, string> = new Map()

  getAvailableLocalCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToURL.keys()).map((s) => new SemVer(s))
  }

  async getLocalURLFromCudaVersion(version: SemVer): Promise<URL> {
    const urlString = this.cudaVersionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }
}
