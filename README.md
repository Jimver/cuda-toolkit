# cuda-toolkit

This action installs the [NVIDIA® CUDA® Toolkit](https://developer.nvidia.com/cuda-toolkit) on the system. It adds the paths as `CUDA_PATH` to `GITHUB_ENV` so you can access the paths in subsequent steps. Right now both `windows-2019` and `ubuntu-20.04` runners have been tested to work successfully.

## Inputs

### `cuda`

**Optional** The CUDA version to install.

Default: `'11.2.2'`.

### `subPackages`

**Optional** If set, only the specified CUDA subpackages will be installed.
Only installs specified subpackages, must be in the form of a JSON array. For example, if you only want to install nvcc and visual studio integration: `"['nvcc', 'visual_studio_integration']"`

Default: `'[]'`.

### `method`

**Optional** NOTE: Right now only 'local' is implemented.

Installation method, can be either 'local' or 'network'. 'local' downloads the entire installer with all packages and runs that (you can still only install certain packages with subPackages). 'network' downloads a smaller executable which only downloads necessary packages which you can define in subPackages.

Default: `'local'`.

## Outputs

### `cuda`

The cuda version installed.

## Example usage

```yaml
uses: Jimver/cuda-toolkit@v0.1
with:
  cuda: '11.2.2'
```
