const { Command } = require("commander");

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

program.parse(process.argv);
