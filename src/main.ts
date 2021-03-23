import * as core from '@actions/core'
import {download} from './downloader'
import {install} from './installer'
import {aptInstall, aptSetup, useApt} from './aptInstaller'
import {Method, parseMethod} from './method'
import {updatePath} from './updatePath'
import {getVersion} from './version'

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

    // Linux network install (uses apt repository)
    const useAptInstall = await useApt(methodParsed)
    if (useAptInstall) {
      // Setup aptitude repos
      const packageName = await aptSetup(version)
      // Install packages
      const installResult = await aptInstall(packageName, subPackagesArray)
      core.debug(`Install result: ${installResult}`)
    } else {
      // Download
      const executablePath: string = await download(version, methodParsed)

      // Install
      await install(executablePath, subPackagesArray, linuxLocalArgsArray)
    }

    // Add CUDA environment variables to GitHub environment variables
    const cudaPath: string = await updatePath(version, useAptInstall)

    // Set output variables
    core.setOutput('cuda', cuda)
    core.setOutput('CUDA_PATH', cudaPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
