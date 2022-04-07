# The Graph
This repository contains multiple subgraphs:
- [auction-maker](./subgraphs/auction-maker/README.md)
- [bentobox](./subgraphs/bentobox/README.md)
- [blocks](./subgraphs/blocks/README.md)
- [candles](./subgraphs/candles/README.md)
- [furo-stream](./subgraphs/furo-stream/README.md)
- [furo-vesting](./subgraphs/furo-vesting/README.md)
- [legacy-exchange](./subgraphs/legacy-exchange/README.md)
- [miso](./subgraphs/miso/README.md)
- [staking](./subgraphs/staking/README.md)
- [sushi](./subgraphs/sushi/README.md)
- [trident](./subgraphs/trident/README.md)
- [xsushi](./subgraphs/xsushi/README.md)

## CLI

### Prepare
Replace `<APP_NAME>` and `<NETWORK>`, e.g. `miso` and `kovan`
```sh
node . prepare <APP_NAME> <NETWORK>
```

### Deploy

```sh
node . deploy <APP_NAME> <NETWORK>
```

### Logging
```sh
node . log sushiswap/<SUBGRAPH_NAME> 
```

## Testing

https://thegraph.com/docs/developer/matchstick

```sh
# Run all tests
yarn workspace @sushiswap/<APP_NAME>-subgraph graph test -r

# Run single test
yarn workspace @sushiswap/<APP_NAME>-subgraph graph test <TEST_NAME> -r
```


## Misc
Deploy a subgraph by running the command below and replacing `<APP_NAME>` and `<NETWORK_TYPE>`, e.g. `miso` and `kovan`
```sh
APP=<APP_NAME> && NETWORK=<NETWORK_TYPE> && \
node . prepare $APP $NETWORK && \
yarn workspace @sushiswap/$APP-subgraph codegen && \
yarn workspace @sushiswap/$APP-subgraph build
```

```sh
yarn workspace @sushiswap/$APP-subgraph deploy:$NETWORK
```


## Query 

Example
```sh
node . prepare miso kovan && yarn workspace @sushiswap/miso-subgraph codegen && yarn workspace @sushiswap/miso-subgraph build && yarn workspace @sushiswap/miso-subgraph deploy-kovan
```

curl -X POST -d '{ "query": "{indexingStatusForCurrentVersion(subgraphName: \"sushiswap/kovan-miso\") { chains { latestBlock { hash number }}}}"}' https://api.thegraph.com/index-node/graphql

