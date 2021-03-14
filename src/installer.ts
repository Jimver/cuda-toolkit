import {exec} from '@actions/exec'
import {SemVer} from 'semver'
import {download} from './downloader'
import * as core from '@actions/core'
import {getOs, OSType} from './platform'
import * as artifact from '@actions/artifact'

export async function install(version: SemVer): Promise<void> {
  const executablePath: string = await download(version)
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
  // Install arguments, see: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced
  // and https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
  let installArgs: string[]
  switch (await getOs()) {
    case OSType.linux:
      installArgs = ['--silent']
      break
    case OSType.windows:
      installArgs = ['-s']
      break
  }
  core.debug(`Running install executable: ${executablePath}`)
  const exitCode = await exec(executablePath, installArgs, options)
  core.debug(`Installer exit code: ${exitCode}`)
  if ((await getOs()) === OSType.linux) {
    const artifactClient = artifact.create()
    const artifactName = 'install-log'
    const files = ['/tmp/cuda-installer.log']
    const rootDirectory = '/tmp'
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
