package main

import (
	"github.com/streamingfast/sparkle/cli"
	"github.com/streamingfast/sparkle/entity"
	"github.com/streamingfast/sparkle/subgraph"
	"github.com/sushiswap/trident/subgraph"
)

func main() {
	subgraph.MainSubgraphDef = subgraph.Definition
	cli.Execute()
}
