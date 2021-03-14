import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as tc from '@actions/tool-cache'
import {SemVer} from 'semver'
import {getLinks} from './links/getLinks'
import {AbstractLinks} from './links/links'
import {getOs, OSType} from './platform'

// Download helper which returns the installer executable and caches it for next runs
export async function download(version: SemVer): Promise<string> {
  // First try to find tool with desired version in tool cache
  const toolName = 'cuda_installer'
  const toolPath = tc.find(toolName, `${version}`)
  // Path that contains the executable file
  let executablePath: string
  if (toolPath) {
    // Tool is already in cache
    core.debug(`Found in cache ${toolPath}`)
    executablePath = toolPath
  } else {
    core.debug(`Not found in cache, downloading...`)
    // Get download URL
    const links: AbstractLinks = await getLinks()
    const url: URL = links.getURLFromCudaVersion(version)
    // Get intsaller filename extension depending on OS
    let fileExtension: string
    const osType = await getOs()
    switch (osType) {
      case OSType.windows:
        fileExtension = 'exe'
        break
      case OSType.linux:
        fileExtension = 'run'
        break
    }
    // Pathname for destination
    const destFileName = `${toolName}_${version}.${fileExtension}`
    // Download executable
    const path: string = await tc.downloadTool(url.toString(), destFileName)
    // Cache download
    const cachedPath = await tc.cacheFile(
      path,
      destFileName,
      toolName,
      `${version}`
    )
    executablePath = cachedPath
  }
  // String with full executable path
  let fullExecutablePath: string | undefined
  // Execute options with callback for stdout
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        // Check if path was already set
        if (fullExecutablePath) {
          throw new Error(
            `Path was already set to ${fullExecutablePath}, while trying it to set to ${executablePath}/${data.toString()}. Only 1 executable file is expected to be in the tool cache!`
          )
        }
        // Set full executablepath to path + filename
        fullExecutablePath = `${executablePath}/${data.toString()}`
      },
      stderr: (data: Buffer) => {
        core.debug(data.toString())
        throw new Error('Error getting executable in tool cache!')
      }
    }
  }
  // list files
  await exec('ls', [executablePath], options)
  if (!fullExecutablePath) {
    throw new Error(`No tool found in tool cache: ${executablePath}`)
  }
  // Return full executable path
  return fullExecutablePath
}
