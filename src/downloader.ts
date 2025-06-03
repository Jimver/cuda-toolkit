import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import { OSType, getOs, getRelease } from './platform.js'
import { AbstractLinks } from './links/links.js'
import { Method } from './method.js'
import { SemVer } from 'semver'
import { WindowsLinks } from './links/windows-links.js'
import fs from 'fs'
import { getLinks } from './links/get-links.js'
import { getArch } from './arch.js'

// Download helper which returns the installer executable and caches it for next runs
export async function download(
  version: SemVer,
  method: Method,
  useLocalCache: boolean,
  useGitHubCache: boolean
): Promise<string> {
  // First try to find tool with desired version in tool cache (local to machine)
  const toolName = 'cuda_installer'
  const osType = await getOs()
  const cpuArch = await getArch()
  const osRelease = await getRelease()
  const toolId = `${toolName}-${osType}-${osRelease}-${cpuArch}`
  // Path that contains the executable file
  let executableDirectory: string | undefined
  const cacheKey = `${toolId}-${version}`
  const cacheDirectory = cacheKey
  if (useLocalCache) {
    const toolPath = tc.find(toolId, `${version}`)
    if (toolPath) {
      // Tool is already in cache
      core.debug(`Found in local machine cache ${toolPath}`)
      executableDirectory = toolPath
    } else {
      core.debug(`Not found in local cache`)
    }
  }
  if (executableDirectory === undefined && useGitHubCache) {
    // Second option, get tool from GitHub cache if enabled
    const cacheResult: string | undefined = await cache.restoreCache(
      [cacheDirectory],
      cacheKey
    )
    if (cacheResult !== undefined) {
      core.debug(`Found in GitHub cache ${cacheDirectory}`)
      executableDirectory = cacheDirectory
    } else {
      core.debug(`Not found in GitHub cache`)
    }
  }
  if (executableDirectory === undefined) {
    // Final option, download tool from NVIDIA servers
    core.debug(`Not found in local/GitHub cache, downloading...`)
    // Get download URL
    const url: URL = await getDownloadURL(method, version)
    // Get intsaller filename extension depending on OS
    const fileExtension: string = getFileExtension(osType)
    const downloadDirectory = `cuda_download`
    const destFileName = `${toolId}_${version}.${fileExtension}`
    const destFilePath = `${downloadDirectory}/${destFileName}`
    // Check if file already exists
    if (!(await fileExists(destFilePath))) {
      core.debug(`File at ${destFilePath} does not exist, downloading`)
      // Download executable
      await tc.downloadTool(url.toString(), destFilePath)
    } else {
      core.debug(`File at ${destFilePath} already exists, skipping download`)
    }
    if (useLocalCache) {
      // Cache download to local machine cache
      const localCacheDirectory = await tc.cacheFile(
        destFilePath,
        destFileName,
        `${toolName}-${osType}-${cpuArch}`,
        `${version}`
      )
      core.debug(
        `Cached download to local machine cache at ${localCacheDirectory}`
      )
      executableDirectory = localCacheDirectory
    }
    if (useGitHubCache) {
      // Move file to GitHub cache directory
      const cachePath = `${cacheDirectory}/${destFileName}`
      core.debug(`Moving ${destFilePath} to ${cachePath}`)
      await io.mkdirP(cacheDirectory)
      await io.mv(destFilePath, cachePath)
      // Create test file in cacheDirectory
      const testFilePath = `${cacheDirectory}/test.txt`
      core.debug(`Creating test file at ${testFilePath}`)
      await fs.promises.writeFile(
        testFilePath,
        `This is a test file to verify that the cache directory is working correctly.`
      )
      // List files in cache directory
      const filesInCacheDirectory = await (
        await glob.create(`${cacheDirectory}/**`)
      ).glob()
      core.debug(
        `Files in cache directory: ${cacheDirectory}: ${filesInCacheDirectory}`
      )
      // Save cache directory to GitHub cache
      const cacheId = await cache.saveCache([cacheDirectory], cacheKey)
      if (cacheId !== -1) {
        core.debug(`Cached download to GitHub cache with cache id ${cacheId}`)
      } else {
        core.debug(`Did not cache, cache possibly already exists`)
      }
      core.debug(`Tool was moved to cache directory ${cacheDirectory}`)
      executableDirectory = cacheDirectory
    }
    if (executableDirectory === undefined) {
      executableDirectory = downloadDirectory
    }
  }
  core.debug(`Executable path ${executableDirectory}`)
  // String with full executable path
  let fullExecutablePath: string
  // Get list of files in tool cache
  const filesInCache = await (
    await glob.create(`${executableDirectory}/**.*`)
  ).glob()
  core.debug(`Files in tool cache:`)
  for (const f of filesInCache) {
    core.debug(f)
  }
  if (filesInCache.length > 1) {
    throw new Error(`Got multiple file in tool cache: ${filesInCache.length}`)
  } else if (filesInCache.length === 0) {
    throw new Error(`Got no files in tool cache`)
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath)
    core.debug(`Got the following stats for ${filePath}: ${stats}`)
    return !!stats
  } catch (e) {
    core.debug(`Got error while checking if ${filePath} exists: ${e}`)
    return false
  }
}

async function getDownloadURL(method: string, version: SemVer): Promise<URL> {
  const links: AbstractLinks = await getLinks()
  switch (method) {
    case 'local':
      return await links.getLocalURLFromCudaVersion(version)
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
