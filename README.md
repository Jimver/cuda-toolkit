# cuda-toolkit

This action installs the [NVIDIA® CUDA® Toolkit](https://developer.nvidia.com/cuda-toolkit) on the system. It adds the cuda install location as `CUDA_PATH` to `GITHUB_ENV` so you can access the CUDA install location in subsequent steps. `CUDA_PATH/bin` is added to `GITHUB_PATH` so you can use commands such as `nvcc` directly in subsequent steps. Right now both `windows-2019` and `ubuntu-20.04` runners have been tested to work successfully.

## Inputs

### `cuda`

**Optional** The CUDA version to install. View `src/link/windows-links.ts` and `src/link/linux-links.ts` for available versions.

Default: `'12.1.0'`.

### `sub-packages`

**NOTE: On Linux this only works with the 'network' method [view details](#method)**

**Optional**
If set, only the specified CUDA subpackages will be installed.
Only installs specified subpackages, must be in the form of a JSON array. For example, if you only want to install nvcc and visual studio integration: `'["nvcc", "visual_studio_integration"]'` (double quotes required)

Default: `'[]'`.

### `method`

**Optional**
Installation method, can be either `'local'` or `'network'`.

- `'local'` downloads the entire installer with all packages and runs that (you can still only install certain packages with `sub-packages` on Windows).
- `'network'` downloads a smaller executable which only downloads necessary packages which you can define in `sub-packages`.

Default: `'local'`.

### `linux-local-args`

**Optional**
(For Linux and 'local' method only) override arguments for the Linux `.run` installer. For example if you don't want samples use `'["--toolkit"]'` (double quotes required)
See the [Nvidia Docs](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced) for available options. Note that the `--silent` option is already always added by the action itself.

Default: `'["--toolkit", "--samples"]'`.

## Outputs

### `cuda`

The cuda version installed (same as `cuda` from input).

### `CUDA_PATH`

The path where cuda is installed (same as `CUDA_PATH` in `GITHUB_ENV`).

## Example usage

```yaml
steps:
- uses: Jimver/cuda-toolkit@v0.2.9
  id: cuda-toolkit
  with:
    cuda: '12.1.0'

- run: echo "Installed cuda version is: ${{steps.cuda-toolkit.outputs.cuda}}"

- run: echo "Cuda install location: ${{steps.cuda-toolkit.outputs.CUDA_PATH}}"

- run: nvcc -V
```
