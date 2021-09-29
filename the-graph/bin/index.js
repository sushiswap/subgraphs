const { Command } = require("commander");
const { exec } = require("child_process");

const program = new Command();

program
  .command('prepare')
  .arguments('<subgraph> <network>')
  .action((subgraph, network) => {
    console.log("prepare command called", { subgraph, network });
  });

program
.command('deploy')
.arguments('<subgraph> <network>')
.action((subgraph, network) => {
  console.log("deploy command called", { subgraph, network });
});

program
.command('log')
.arguments('<subgraphName>')
.option('-v, --version <version>', 'Which version to get logs for', 'pending')
.action((subgraphName = 'sushiswap/trident', options) => {
  // console.log("log command called", { subgraphName, options });

  const method = {
    current: 'indexingStatusForCurrentVersion',
    pending: 'indexingStatusForPendingVersion'
  }

  exec(`curl --location --request POST 'https://api.thegraph.com/index-node/graphql' --data '{"query":"{ ${method[options.version]}(subgraphName: \\"${subgraphName}\\") { subgraph synced fatalError { message } nonFatalErrors { message } } }"}'`, (error, data, getter) => {
    if(error){
      console.log("error",error.message);
      return;
    }
    if(getter){
      console.log("data",data);
      return;
    }
    console.log("data",data);
  });
});

program.parse(process.argv);
