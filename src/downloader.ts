import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import {OSType, getOs, getRelease} from './platform'
import {AbstractLinks} from './links/links'
import {Method} from './method'
import {SemVer} from 'semver'
import {WindowsLinks} from './links/windows-links'
import fs from 'fs'
import {getLinks} from './links/get-links'

// Download helper which returns the installer executable and caches it for next runs
export async function download(
  version: SemVer,
  method: Method,
  useGitHubCache: boolean
): Promise<string> {
  // First try to find tool with desired version in tool cache (local to machine)
  const toolName = 'cuda_installer'
  const osType = await getOs()
  const osRelease = await getRelease()
  const toolId = `${toolName}-${osType}-${osRelease}`
  const toolPath = tc.find(toolId, `${version}`)
  // Path that contains the executable file
  let executablePath: string
  if (toolPath) {
    // Tool is already in cache
    core.debug(`Found in local machine cache ${toolPath}`)
    executablePath = toolPath
  } else {
    // Second option, get tool from GitHub cache if enabled
    const cacheKey = `${toolId}-${version}`
    const cachePath = cacheKey
    let cacheResult: string | undefined
    if (useGitHubCache) {
      cacheResult = await cache.restoreCache([cachePath], cacheKey)
    }
    if (cacheResult !== undefined) {
      core.debug(`Found in GitHub cache ${cachePath}`)
      executablePath = cachePath
    } else {
      // Final option, download tool from NVIDIA servers
      core.debug(`Not found in local/GitHub cache, downloading...`)
      // Get download URL
      const url: URL = await getDownloadURL(method, version)
      // Get intsaller filename extension depending on OS
      const fileExtension: string = getFileExtension(osType)
      const destFileName = `${toolId}_${version}.${fileExtension}`
      // Download executable
      const downloadPath: string = await tc.downloadTool(
        url.toString(),
        destFileName
      )
      // Copy file to GitHub cachePath
      core.debug(`Copying ${destFileName} to ${cachePath}`)
      await io.mkdirP(cachePath)
      await io.cp(destFileName, cachePath)
      // Cache download to local machine cache
      const localCachePath = await tc.cacheFile(
        downloadPath,
        destFileName,
        `${toolName}-${osType}`,
        `${version}`
      )
      core.debug(`Cached download to local machine cache at ${localCachePath}`)
      // Cache download to GitHub cache if enabled
      if (useGitHubCache) {
        const cacheId = await cache.saveCache([cachePath], cacheKey)
        if (cacheId !== -1) {
          core.debug(`Cached download to GitHub cache with cache id ${cacheId}`)
        } else {
          core.debug(`Did not cache, cache possibly already exists`)
        }
      }
      executablePath = localCachePath
    }
  }
  // String with full executable path
  let fullExecutablePath: string
  // Get list of files in tool cache
  const filesInCache = await (
    await glob.create(`${executablePath}/**.*`)
  ).glob()
  core.debug(`Files in tool cache:`)
  for (const f of filesInCache) {
    core.debug(f)
  }
  if (filesInCache.length > 1) {
    throw new Error(`Got multiple file in tool cache: ${filesInCache.length}`)
  } else if (filesInCache.length === 0) {
    throw new Error(`Got no files in tool cahce`)
  } else {
    fullExecutablePath = filesInCache[0]
  }
  // Make file executable on linux
  if ((await getOs()) === OSType.linux) {
    // 0755 octal notation permission is: owner(r,w,x), group(r,w,x), other(r,x) where r=read, w=write, x=execute
    await fs.promises.chmod(fullExecutablePath, '0755')
  }
  // Return full executable path
  return fullExecutablePath
}

function getFileExtension(osType: OSType): string {
  switch (osType) {
    case OSType.windows:
      return 'exe'
    case OSType.linux:
      return 'run'
  }
}

async function getDownloadURL(method: string, version: SemVer): Promise<URL> {
  const links: AbstractLinks = await getLinks()
  switch (method) {
    case 'local':
      return links.getLocalURLFromCudaVersion(version)
    case 'network':
      if (!(links instanceof WindowsLinks)) {
        core.debug(`Tried to get windows links but got linux links instance`)
        throw new Error(
          `Network mode is not supported by linux, shouldn't even get here`
        )
      }
      return links.getNetworkURLFromCudaVersion(version)
    default:
      throw new Error(
        `Invalid method: expected either 'local' or 'network', got '${method}'`
      )
  }
}
