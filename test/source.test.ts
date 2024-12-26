import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { getPackageInfo, importModule, isPackageExists, loadPackageJSON, resolveModule } from '../src'

it('test by source', async () => {
  expect(resolveModule('@ajiu9/eslint-config')).to.contain(join('node_modules', '@ajiu9', 'eslint-config'))

  expect(isPackageExists('unbuild')).to.eq(true)
  expect(isPackageExists('hahaha')).to.eq(false)

  const { isObject } = (await importModule('@ajiu9/shared'))
  expect(isObject({})).to.eq(true)

  const info1 = await getPackageInfo('@ajiu9/eslint-config')
  expect(!!info1).to.eq(true)
  expect(info1.name).to.eq('@ajiu9/eslint-config')
  expect(info1.packageJson.name).to.eq('@ajiu9/eslint-config')

  expect(await loadPackageJSON()).to.eql(JSON.parse(await fs.readFile('./package.json'), 'utf-8'))
})
