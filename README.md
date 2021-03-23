# cuda-toolkit

This action installs the [NVIDIA® CUDA® Toolkit](https://developer.nvidia.com/cuda-toolkit) on the system. It adds the cuda install location as `CUDA_PATH` to `GITHUB_ENV` so you can access the CUDA install location in subsequent steps. `CUDA_PATH/bin` is added to `GITHUB_PATH` so you can use commands such as `nvcc` directly in subsequent steps. Right now both `windows-2019` and `ubuntu-20.04` runners have been tested to work successfully.

## Inputs

### `cuda`

**Optional** The CUDA version to install. View `src/link/windowsLinks.ts` and `src/link/linuxLinks.ts` for available versions.

Default: `'11.2.2'`.

### `subPackages`

**NOTE: On Linux this only works with the 'network' method [view details](#method)**

**Optional**
If set, only the specified CUDA subpackages will be installed.
Only installs specified subpackages, must be in the form of a JSON array. For example, if you only want to install nvcc and visual studio integration: `"['nvcc', 'visual_studio_integration']"`

Default: `'[]'`.

### `method`

**Optional**
Installation method, can be either `'local'` or `'network'`.
- `'local'` downloads the entire installer with all packages and runs that (you can still only install certain packages with subPackages on Windows). 
- `'network'` downloads a smaller executable which only downloads necessary packages which you can define in subPackages.

Default: `'local'`.

### `linux-local-args`

**Optional**
(For Linux and 'local' method only) override arguments for the Linux `.run` installer. For example if you don't want samples use ['--driver', '--toolkit']

Default: `"['--driver', '--toolkit', '--samples']"`.

## Outputs

### `cuda`

The cuda version installed (same as `cuda` from input).

## Example usage

```yaml
steps:
- uses: Jimver/cuda-toolkit@v0.1.0
  id: cuda-toolkit
  with:
    cuda: '11.2.2'

- run: echo "Installed cuda version is: ${{steps.cuda-toolkit.outputs.cuda}}"

- run: nvcc -V
```
