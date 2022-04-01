# The Graph

## CLI

### Prepare

```sh
node . prepare trident kovan
```

### Deploy

```sh
node . deploy trident kovan
```

### Logging

```sh
node . log sushiswap/trident
```

## Trident Subgraph

### Codegen

```sh
yarn workspace @sushiswap/trident-subgraph codegen
```

### Build

```sh
yarn workspace @sushiswap/trident-subgraph build
```

## Testing

https://thegraph.com/docs/developer/matchstick

graph test <ONE-OR-MORE-TEST-NAMES>

graph test MasterDeployer

```sh
node . prepare miso kovan && yarn workspace @sushiswap/miso-subgraph codegen && yarn workspace @sushiswap/miso-subgraph build && yarn workspace @sushiswap/miso-subgraph deploy-kovan
```

curl -X POST -d '{ "query": "{indexingStatusForCurrentVersion(subgraphName: \"sushiswap/kovan-miso\") { chains { latestBlock { hash number }}}}"}' https://api.thegraph.com/index-node/graphql