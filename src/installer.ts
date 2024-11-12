import artifact from '@actions/artifact'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {OSType, getOs, getRelease} from './platform'
import {SemVer} from 'semver'
import {exec} from '@actions/exec'

export async function install(
  executablePath: string,
  version: SemVer,
  subPackagesArray: string[],
  linuxLocalArgsArray: string[],
  method: string,
  logFileSuffix: string
): Promise<void> {
  // Install arguments, see: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced
  // and https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
  let installArgs: string[]

  // Command string that is executed
  let command: string

  // Subset of subpackages to install instead of everything, see: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#install-cuda-software
  const subPackages: string[] = subPackagesArray

  // Execution options which contain callback functions for stdout and stderr of install process
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  // Configure OS dependent run command and args
  switch (await getOs()) {
    case OSType.linux:
      // Root permission needed on linux
      command = `sudo ${executablePath}`
      // Install silently, and add additional arguments
      installArgs = ['--silent'].concat(linuxLocalArgsArray)
      break
    case OSType.windows:
      // Windows handles permissions automatically
      command = executablePath
      // Install silently
      installArgs = ['-s']
      // Add subpackages to command args (if any)
      installArgs = installArgs.concat(
        subPackages.map(subPackage => {
          // Display driver sub package name is not dependent on version
          if (subPackage === 'Display.Driver') {
            return subPackage
          }
          return `${subPackage}_${version.major}.${version.minor}`
        })
      )
      break
  }

  // Run installer
  try {
    core.debug(`Running install executable: ${executablePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.warning(`Error during installation: ${error}`)
    throw error
  } finally {
    // Always upload installation log regardless of error
    const osType = await getOs()
    const osRelease = await getRelease()
    if (osType === OSType.linux) {
      const artifactName = `cuda-install-${osType}-${osRelease}-${method}-${logFileSuffix}`
      const patterns = ['/var/log/cuda-installer.log']
      const globber = await glob.create(patterns.join('\n'))
      const files = await globber.glob()
      if (files.length > 0) {
        // If any of the files is not readable without root permissions, the upload will fail, so we need to
        // fix the permissions first
        for (const file of files) {
          await exec(`sudo chmod 644 ${file}`)
          await exec(`sudo chown \`whoami\` ${file}`)
        }
        const rootDirectory = '/var/log'
        const uploadResult = await artifact.uploadArtifact(
          artifactName,
          files,
          rootDirectory
        )
        core.debug(`Upload result: ${uploadResult}`)
      } else {
        core.debug(`No log file to upload`)
      }
    }
  }
}
