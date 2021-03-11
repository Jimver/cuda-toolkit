import {SemVer} from 'semver'

// Interface for getting cuda versions and corresponding download URLs
export abstract class AbstractLinks {
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
