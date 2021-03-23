import * as core from '@actions/core'
import {download} from './downloader'
import {install} from './installer'
import {aptInstall, aptSetup, useApt} from './aptInstaller'
import {Method, parseMethod} from './method'
import {updatePath} from './updatePath'
import {getVersion} from './version'
import {getOs, OSType} from './platform'

async function run(): Promise<void> {
  try {
    const cuda: string = core.getInput('cuda')
    core.debug(`Desired cuda version: ${cuda}`)
    const subPackages: string = core.getInput('subPackages')
    core.debug(`Desired subPackes: ${subPackages}`)
    const methodString: string = core.getInput('method')
    core.debug(`Desired method: ${methodString}`)
    const linuxLocalArgs: string = core.getInput('linux-local-args')
    core.debug(`Desired local linux args: ${linuxLocalArgs}`)

    // Parse subPackages array
    let subPackagesArray: string[] = []
    try {
      subPackagesArray = JSON.parse(subPackages)
      // TODO verify that elements are valid package names (nvcc, etc.)
    } catch (error) {
      const errString = `Error parsing input 'subPackages' to a JSON string array: ${subPackages}`
      core.debug(errString)
      throw new Error(errString)
    }

    // Parse method
    const methodParsed: Method = parseMethod(methodString)
    core.debug(`Parsed method: ${methodParsed}`)

    // Parse version string
    const version = await getVersion(cuda, methodParsed)

    // Parse linuxLocalArgs array
    let linuxLocalArgsArray: string[] = []
    try {
      linuxLocalArgsArray = JSON.parse(linuxLocalArgs)
      // TODO verify that elements are valid package names (--samples, --driver, --toolkit, etc.)
    } catch (error) {
      const errString = `Error parsing input 'linux-local-args' to a JSON string array: ${linuxLocalArgs}`
      core.debug(errString)
      throw new Error(errString)
    }

    // Check if subPackages are specified in 'local' method on Linux
    if (
      methodParsed === 'local' &&
      subPackagesArray.length > 0 &&
      (await getOs()) === OSType.linux
    ) {
      throw new Error(
        `Subpackages on 'local' method is not supported on Linux, use 'network' instead`
      )
    }

    // Linux network install (uses apt repository)
    const useAptInstall = await useApt(methodParsed)
    if (useAptInstall) {
      // Setup aptitude repos
      await aptSetup(version)
      // Install packages
      const installResult = await aptInstall(version, subPackagesArray)
      core.debug(`Install result: ${installResult}`)
    } else {
      // Download
      const executablePath: string = await download(version, methodParsed)

      // Install
      await install(executablePath, subPackagesArray, linuxLocalArgsArray)
    }

    // Add CUDA environment variables to GitHub environment variables
    await updatePath(version)

    core.setOutput('cuda', cuda)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
