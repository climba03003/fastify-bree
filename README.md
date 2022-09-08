# fastify-bree

[![Continuous Integration](https://github.com/climba03003/fastify-bree/actions/workflows/ci.yml/badge.svg)](https://github.com/climba03003/fastify-bree/actions/workflows/ci.yml)
[![Package Manager CI](https://github.com/climba03003/fastify-bree/actions/workflows/package-manager-ci.yml/badge.svg)](https://github.com/climba03003/fastify-bree/actions/workflows/package-manager-ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-bree.svg?style=flat)](https://www.npmjs.com/package/fastify-bree)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/climba03003/fastify-bree)](https://github.com/climba03003/fastify-bree)
[![GitHub](https://img.shields.io/github/license/climba03003/fastify-bree)](https://github.com/climba03003/fastify-bree)

This plugin integrate [`bree`](https://github.com/breejs/bree) with `fastify` to support scheduling jobs.

> Disclaimer: Although this plugin add a handy method to integrate with TypeScript. It is a known issue TypeScript do not have a good support about `worker_threads`.

## Install
```
npm install fastify-bree --save

yarn add fastify-bree
```

## Usage

```ts
import Fastifybree from 'fastify-bree'
import * as path from 'path'

fastify.register(Fastifybree, {
  customOptions: {
    root: path.resolve('jobs')
  }
})

await fastify.bree.add({
  name: 'cron' // which will use the file - `process.cwd()/jobs/cron.ts`
})

```

### Options

#### options.customOptions

The options which will be directly passed to `bree`.

```ts
import Fastifybree from 'fastify-bree'

fastify.register(Fastifybree, {
  customOptions: {
    
  }
})
```

See: [`bree`](https://github.com/breejs/bree)

#### options.autoStart

This options will add a `onReady` hooks to start all pre-registered jobs.

```ts
import Fastifybree from 'fastify-bree'

fastify.register(Fastifybree, {
  autoStart: true
})
```

#### options.autoClose

This options will add a `onClose` hooks to stop all running jobs.

```ts
import Fastifybree from 'fastify-bree'

fastify.register(Fastifybree, {
  autoClose: true
})
```
