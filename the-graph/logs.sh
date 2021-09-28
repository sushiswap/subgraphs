# /bin/sh

curl --location --request POST 'https://api.thegraph.com/index-node/graphql'  --data-raw '{"query":"{ indexingStatusForPendingVersion(subgraphName: \"sushiswap/trident\") { subgraph synced fatalError { message } nonFatalErrors {message } } }"}'