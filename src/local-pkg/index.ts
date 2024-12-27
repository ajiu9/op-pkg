/**
 * copy from https://github.com/antfu/local-pkg
 */
import type { PackageJson } from 'pkg-types'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, win32 } from 'node:path'
import process from 'node:process'
import { findUp } from 'find-up'
import { interopDefault, resolvePathSync } from 'mlly'

export interface PackageInfo {
  name: string
  rootPath: string
  packageJsonPath: string
  version: string
  packageJson: PackageJson
}

export interface PackageResolvingOptions {
  paths?: string[]

  /**
   * @default 'auto'
   * Resolve path as posix or win32
   */
  platform?: 'posix' | 'win32' | 'auto'
}

function _resolve(path: string, options: PackageResolvingOptions = {}) {
  if (options.platform === 'auto' || !options.platform)
    options.platform = process.platform === 'win32' ? 'win32' : 'posix'

  if (process.versions.pnp) {
    const paths = options.paths || []
    if (paths.length === 0)
      paths.push(process.cwd())
    const targetRequire = createRequire(import.meta.url)
    try {
      return targetRequire.resolve(path, { paths })
    }
    catch {}
  }

  const modulePath = resolvePathSync(path, {
    url: options.paths,
  })
  if (options.platform === 'win32')
    return win32.normalize(modulePath)
  return modulePath
}

export function resolveModule(name: string, options: PackageResolvingOptions = {}) {
  try {
    return _resolve(name, options)
  }
  catch {
    return undefined
  }
}

export async function importModule<T = any>(path: string): Promise<T> {
  const i = await import(path)
  if (i)
    return interopDefault(i)
  return i
}

export function isPackageExists(name: string, options: PackageResolvingOptions = {}) {
  return !!resolvePackage(name, options)
}

export async function getPackageInfo(name: string, options: PackageResolvingOptions = {}): Promise<PackageInfo | undefined> {
  const packageJsonPath = getPackageJsonPath(name, options)
  if (!packageJsonPath)
    return

  const packageJson: PackageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'))

  return {
    name,
    version: packageJson.version!,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson,
  }
}

export async function loadPackageJSON(cwd = process.cwd()): Promise<PackageJson | null> {
  const path = await findUp('package.json', { cwd } as any)
  if (!path || !fs.existsSync(path))
    return null
  return JSON.parse(await fsp.readFile(path, 'utf-8'))
}

function getPackageJsonPath(name: string, options: PackageResolvingOptions = {}) {
  const entry = resolvePackage(name, options)
  if (!entry)
    return

  return searchPackageJSON(entry)
}

function searchPackageJSON(dir: string) {
  let packageJsonPath
  while (true) {
    if (!dir)
      return
    const newDir = dirname(dir)
    if (newDir === dir)
      return
    dir = newDir
    packageJsonPath = join(dir, 'package.json')
    if (fs.existsSync(packageJsonPath))
      break
  }

  return packageJsonPath
}

function resolvePackage(name: string, options: PackageResolvingOptions = {}) {
  try {
    return _resolve(`${name}/package.json`, options)
  }
  catch {
  }
  try {
    return _resolve(name, options)
  }
  catch (e: any) {
    // compatible with nodejs and mlly error
    if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ERR_MODULE_NOT_FOUND')
      console.error(e)
    return false
  }
}
