# op-pkg

## Usage

```ts
import {
  importModule,
  isPackageExists,
  resolveModule
} from 'op-pkg'

isPackageExists('op-pkg') // true

// similar to `require.resolve` but works also in ESM
resolveModule('op-pkg')
// '/path/to/node_modules/op-pkg/dist/index.cjs'

// similar to `await import()` but works also in CJS
const { importModule } = await importModule('op-pkg')
```

## License

[MIT](./LICENSE) License © 2024-PRESENT [Ajiu9](https://github.com/ajiu9)
