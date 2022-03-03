# The Graph
This repository contains multiple subgraphs:
- [bentobox](./subgraphs/bentobox/README.md)
- [blocks](./subgraphs/blocks/README.md)
- [candles](./subgraphs/candles/README.md)
- [legacy-exchange](./subgraphs/legacy-exchange/README.md)
- [staking](./subgraphs/staking/README.md)
- [trident](./subgraphs/trident/README.md)

## CLI

### Prepare
Replace `<APP_NAME>` and `<NETWORK>` with i.e. `miso` and `kovan`
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
curl -X POST -d '{ "query": "{indexingStatusForCurrentVersion(subgraphName: \"sushiswap/kovan-miso\") { chains { latestBlock { hash number }}}}"}' https://api.thegraph.com/index-node/graphql
```