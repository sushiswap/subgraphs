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

Deploy to `sushiswap/<APPNAME>-<NETWORK>`

```sh
node . deploy <APP_NAME> <NETWORK> 
```

Deploy to another user, e.g. miso to kovan  

```sh
node . deploy miso kovan -u <USERNAME>
```

### List network and contracts

List networks and available contracts

```sh
node . ls
```

Output example:

```sh
arbitrum contracts:
        - native
        - sushi
        - weth
        - wbtc
        - bentobox
        - whitelistedTokenAddresses
        - stableTokenAddresses
        - minimumNativeLiquidity
        - legacy

avalanche contracts:
        - bentobox
        - legacy

...
```

### Logging

```sh
node . log sushiswap/<SUBGRAPH_NAME> 
```

## Testing

[Matchstick documentation](https://thegraph.com/docs/developer/matchstick)

```sh
# Run all tests
pnpm exec turbo run test --scope=<SUBGRAPH_NAME>

# Run single test
pnpm exec turbo run test -- <TEST> --scope=<SUBGRAPH_NAME>
```

## Misc

Deploy a subgraph by running the command below and replacing `<APP_NAME>` and `<NETWORK_TYPE>`, e.g. `miso` and `kovan`

```sh
APP=<APP_NAME> && NETWORK=<NETWORK_TYPE> && \
node . prepare $APP $NETWORK && \
pnpm exec turbo run codegen --scope=$APP && \
pnpm exec turbo run build --scope=$APP
```

```sh
pnpm exec turbo run deploy:$NETWORK --scope=$APP
```

## Query

Example:  

```sh
node . prepare miso kovan && pnpm exec turbo run codegen --scope=miso && pnpm exec turbo run build --scope=miso && pnpm exec turbo run deploy:kovan --scope=miso
```

## Check status

```sh
curl -X POST -d '{ "query": "{indexingStatusForCurrentVersion(subgraphName: \"sushiswap/kovan-miso\") { chains { latestBlock { hash number }}}}"}' https://api.thegraph.com/index-node/graphql
```
