package main

import (
	"github.com/streamingfast/sparkle/cli"
	_ "github.com/streamingfast/sparkle/entity"
	"github.com/streamingfast/sparkle/subgraph"
	"github.com/sushiswap/subgraphs/mappings/bentobox"
)

func main() {
	subgraph.MainSubgraphDef = bentobox.Definition
	cli.Execute()
}
