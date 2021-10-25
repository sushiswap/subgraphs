const { Command } = require('commander')
const { exec } = require('child_process')

const program = new Command()

program
  .command('prepare')
  .arguments('<subgraph> <network>')
  .action((subgraph, network) => {
    console.log('prepare command called', { subgraph, network })
    exec(
      `node_modules/.bin/mustache config/${network}.js subgraphs/${subgraph}/template.yaml > subgraphs/${subgraph}/subgraph.yaml`
    )
  })

program
  .command('deploy')
  .arguments('<subgraph>')
  .action((subgraph) => {
    // TODO: Impl
    console.log('deploy command called', { subgraph })
    exec(
      `node_modules/.bin/graph deploy --product hosted-service sushiswap/${subgraph} subgraphs/${subgraph}/subgraph.yaml`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(error)
          return
        }
        console.log(stdout)
      }
    ).stdout.pipe(process.stdout)
  })

program
  .command('log')
  .arguments('<subgraphName>')
  .option('-v, --version <version>', 'Which version to get logs for', 'pending')
  .action((subgraphName = 'sushiswap/trident', options) => {
    const method = {
      current: 'indexingStatusForCurrentVersion',
      pending: 'indexingStatusForPendingVersion',
    }

    exec(
      `curl --location --request POST 'https://api.thegraph.com/index-node/graphql' --data '{"query":"{ ${
        method[options.version]
      }(subgraphName: \\"${subgraphName}\\") { subgraph synced fatalError { message } nonFatalErrors { message } } }"}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log('error', error.message)
          return
        }
        if (stderr) {
          console.log('data', stdout)
          return
        }
        console.log('data', stdout)
      }
    )
  })

program.parse(process.argv)
