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

graph test Gravity <ONE-OR-MORE-TEST-NAMES>

