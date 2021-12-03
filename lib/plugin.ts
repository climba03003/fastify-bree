import { Worker } from 'worker_threads'

export function BreeTS (options: any, Bree: any): void {
  options = options ?? {}

  const oldInit = Bree.prototype.init

  // we update init script, so the options is match for TypeScript
  Bree.prototype.init = function () {
    // add `.ts` extension to supported list
    if (this.config.acceptedExtensions.includes('.ts') === false) {
      this.config.acceptedExtensions.push('.ts')
    }

    // if it use default option, we change it to `ts`
    if (this.config.defaultExtension === 'js') {
      this.config.defaultExtension = 'ts'
    }

    oldInit.bind(this)()
  }

  const oldCreateWorker = Bree.prototype.createWorker

  // we update the create worker function
  // so it use the correct worker
  Bree.prototype.createWorker = function (filename: string, options: any) {
    if (filename.endsWith('.ts')) {
      options.eval = true
      options.workerData.__filename = filename
      options.workerData.__tsNodeOptions = options.job.tsNodeOptions

      return new Worker(`
const workerData = require('worker_threads').workerData
require('ts-node').register(workerData.__tsNodeOptions)
require(workerData.__filename)
      `, options)
    }

    return oldCreateWorker(filename, options)
  }
}
