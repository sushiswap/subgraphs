const { Command } = require('commander')
const { exec } = require('child_process')
const fs = require('fs')

const program = new Command()

program
  .command('prepare')
  .arguments('<subgraph> <network>')
  .action((subgraph, network) => {
    console.log('prepare command called', { subgraph, network })
    exec(
      `node_modules/.bin/mustache config/${network}.js subgraphs/${subgraph}/template.yaml > subgraphs/${subgraph}/subgraph.yaml`
    )
    exec(
      `node_modules/.bin/mustache config/${network}.js subgraphs/${subgraph}/src/constants/addresses.template.ts > subgraphs/${subgraph}/src/constants/addresses.ts`
    )
  })

program
  .command('deploy')
  .arguments('<subgraph> <network>')
  .option('-u, --user [string]')
  .action((subgraph, network, options) => {
    const user = options.user ? options.user : 'sushiswap'
    console.log(`starting deployment at ${user}/${subgraph}-${network}`)

    exec(
      `node_modules/.bin/mustache config/${network}.js subgraphs/${subgraph}/template.yaml > subgraphs/${subgraph}/subgraph.yaml`
    ).stdout.pipe(process.stdout)
    exec(
      `node_modules/.bin/mustache config/${network}.js subgraphs/${subgraph}/src/constants/addresses.template.ts > subgraphs/${subgraph}/src/constants/addresses.ts`
    ).stdout.pipe(process.stdout)
    exec(`cd subgraphs/${subgraph} && ../../node_modules/.bin/graph codegen`).stdout.pipe(process.stdout)
    exec(`node_modules/.bin/graph build subgraphs/${subgraph}/subgraph.yaml`).stdout.pipe(process.stdout)
    exec(
      `node_modules/.bin/graph deploy --product hosted-service ${user}/${subgraph}-${network} subgraphs/${subgraph}/subgraph.yaml`
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
      }(subgraphName: \\"${subgraphName}\\") { subgraph synced fatalError { message } nonFatalErrors { message } } }"}'`
    ).stdout.pipe(process.stdout)
  })

program.command('ls').action(() => {
  const configPath = './config/'
  const networks = fs.readdirSync(configPath).filter((network) => network.endsWith('.js'))

  for (let i = 0; i < networks.length; i++) {
    const data = require('../'.concat(configPath.concat(networks[i])))
    const network = networks[i].slice(0, networks[i].length - 3)
    console.log(network.concat(' contracts:'))
    const contracts = Object.keys(data).filter((v, i) => i !== 0)
    for (index in contracts) {
      console.log('\t'.concat('- ').concat(contracts[index]))
    }
    console.log('')
  }
})

program.parse(process.argv)
