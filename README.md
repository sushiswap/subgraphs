# The Graph

This repository contains multiple subgraphs:  

- [auction-maker](./subgraphs/auction-maker/README.md)
- [bentobox](./subgraphs/bentobox/README.md)
- [blocks](./subgraphs/blocks/README.md)
- [candles](./subgraphs/candles/README.md)
- [legacy-exchange](./subgraphs/legacy-exchange/README.md)
- [minichef](./subgraphs/minichef/README.md)
- [miso](./subgraphs/miso/README.md)
- [staking](./subgraphs/staking/README.md)
- [sushi](./subgraphs/sushi/README.md)
- [trident](./subgraphs/trident/README.md)
- [xsushi](./subgraphs/xsushi/README.md)

## Build

```sh
NETWORK=polygon pnpm exec turbo run build --scope=<subgraph> --force
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
curl -X POST -d '{ "query": "{indexingStatusForCurrentVersion(subgraphName: \"sushiswap/bentobox-polygon\") { chains { latestBlock { hash number }}}}"}' https://api.thegraph.com/index-node/graphql
```

## CLI

### Logging

```sh
node . log sushiswap/<subgraph> 
```


## Deployment script

add a deploy.sh in the root dir with:
```sh
# V3 DEPLOYMENT
declare -a networks=("ethereum" "gnosis" "moonbeam" "optimism")
SUBGRAPH=v3
DIRECTORY=v3
USER=sushi-v3
ACCESS_TOKEN=SET_YOUR_ACCESS_TOKEN_HERE
for network in "${networks[@]}"
do
    echo "BUILD $network $DIRECTORY" 
    NETWORK=$network pnpm exec turbo run build --scope=$DIRECTORY --force
    echo "DEPLOYING TO $USER/$SUBGRAPH-$network" 
    cd subgraphs/$DIRECTORY/ && pnpm exec graph deploy --product hosted-service $USER/$SUBGRAPH-$network --access-token $ACCESS_TOKEN
    cd ../../
done
```

