import * as core from '@actions/core'
import {download} from './downloader'
import {install} from './installer'
import {aptInstall, aptSetup} from './linuxNetwork'
import {Method, parseMethod} from './method'
import {getOs, OSType} from './platform'
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

    // Check method local, TODO remove when network is implemented
    if (methodParsed === 'network') {
      core.debug(
        `'network' install mode is not yet implemented! Please use 'local' mode instead.`
      )
    }

    // Linux network install (uses apt repository)
    if ((await getOs()) === OSType.linux && methodParsed === 'network') {
      const packageName = await aptSetup(version)
      const installResult = await aptInstall(packageName)
      core.debug(`Install result: ${installResult}`)
      core.setOutput('cuda', cuda)
      return
    }

    // Download
    const executablePath: string = await download(version, methodParsed)

    // Install
    await install(executablePath, subPackagesArray)

    // Add CUDA environment variables to GitHub environment variables
    await updatePath(version)

    core.setOutput('cuda', cuda)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
