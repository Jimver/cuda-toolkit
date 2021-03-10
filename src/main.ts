import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const cuda: string = core.getInput('cuda')
    core.debug(`Desired cuda version: ${cuda}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    // TODO Install cuda here
    // 1. Install
    // 2. Add CUDA environment variables to GitHub environment variables

    //  steps:
    //    - run: echo Cuda version ${{ inputs.cuda }}.
    //      shell: bash
    //    - run: echo Visual Studio version ${{ inputs.visual_studio }}.
    //      shell: bash
    //    - name: Install CUDA (Windows)
    //      if: runner.os == 'Windows'
    //      env:
    //        cuda: ${{ inputs.cuda }}
    //        visual_studio: ${{ inputs.visual_studio }}
    //        ACTION_PATH: ${{ github.action_path }}
    //      shell: powershell
    //      run: |
    //        # Install CUDA via a powershell script
    //        $env:ACTION_PATH\scripts\install_cuda_windows.ps1
    //        if ($?) {
    //          # Set paths for subsequent steps, using $env:CUDA_PATH
    //          echo "Adding CUDA to CUDA_PATH, CUDA_PATH_X_Y and PATH"
    //          echo "CUDA_PATH=$env:CUDA_PATH" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
    //          echo "$env:CUDA_PATH_VX_Y=$env:CUDA_PATH" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
    //          echo "$env:CUDA_PATH/bin" | Out-File -FilePath $env:GITHUB_PATH -Encoding utf8 -Append
    //        }

    core.setOutput('cuda', cuda)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
