import * as core from '@actions/core'

export async function parsePackages(
  subPackages: string,
  parameterName: string
): Promise<string[]> {
  let subPackagesArray: string[] = []
  try {
    subPackagesArray = JSON.parse(subPackages)
  } catch (error) {
    const errString = `Error parsing input '${parameterName}' to a JSON string array: ${subPackages}`
    core.debug(errString)
    throw new Error(errString)
  }
  return subPackagesArray
}
