# fastify-bree

[![Continuous Integration](https://github.com/climba03003/fastify-bree/actions/workflows/ci.yml/badge.svg)](https://github.com/climba03003/fastify-bree/actions/workflows/ci.yml)
[![Package Manager CI](https://github.com/climba03003/fastify-bree/actions/workflows/package-manager-ci.yml/badge.svg)](https://github.com/climba03003/fastify-bree/actions/workflows/package-manager-ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-bree.svg?style=flat)](https://www.npmjs.com/package/fastify-bree)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/climba03003/fastify-bree)](https://github.com/climba03003/fastify-bree)
[![Coverage Status](https://coveralls.io/repos/github/climba03003/fastify-bree/badge.svg?branch=main)](https://coveralls.io/github/climba03003/fastify-bree?branch=master)
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

fastify.bree.register({
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

### Methods

#### register

It is a method to reduce burden between JavaSciprt and TypeScript experience. Internally, it will detect if your environment is run under `ts-node` and modify your options.

```ts
// Register with name only
fastify.bree.register({
  name: 'cron' // which will use the file - `process.cwd()/jobs/cron.ts`
})


// Register with path
fastify.bree.register({
  name: 'cron',
  path: 'cron.ts'
})

// Register with function
fastify.bree.register({
  name: 'cron',
  path: function() {

  }
})
```
