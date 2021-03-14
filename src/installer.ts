import {exec} from '@actions/exec'
import * as core from '@actions/core'
import {getOs, OSType} from './platform'
import * as artifact from '@actions/artifact'

export async function install(
  executablePath: string,
  subPackagesArray: string[]
): Promise<void> {
  // Install arguments, see: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced
  // and https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
  let installArgs: string[]
  // Command string that is executed
  let command: string
  // Subset of subpackages to install instead of everything, see: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#install-cuda-software
  const subPackages: string[] = subPackagesArray
  switch (await getOs()) {
    case OSType.linux:
      // Root permission needed on linux
      command = `sudo ${executablePath}`
      // Install silently
      installArgs = ['--silent']
      break
    case OSType.windows:
      // Windows handles permissions automatically
      command = executablePath
      // Install silently
      installArgs = ['-s']
      break
  }
  // Add subpackages (if any)
  installArgs = installArgs.concat(subPackages)
  try {
    core.debug(`Running install executable: ${executablePath}`)
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          core.debug(data.toString())
        },
        stderr: (data: Buffer) => {
          core.debug(`Error: ${data.toString()}`)
        }
      }
    }
    const exitCode = await exec(command, installArgs, options)
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.debug(`Error during installation: ${error}`)
    throw error
  } finally {
    // Always upload installation log regardless of error
    if ((await getOs()) === OSType.linux) {
      const artifactClient = artifact.create()
      const artifactName = 'install-log'
      const files = ['/var/log/cuda-installer.log']
      const rootDirectory = '/var/log'
      const artifactOptions = {
        continueOnError: true
      }
      const uploadResult = await artifactClient.uploadArtifact(
        artifactName,
        files,
        rootDirectory,
        artifactOptions
      )
      core.debug(`Upload result: ${uploadResult}`)
    }
  }
}
