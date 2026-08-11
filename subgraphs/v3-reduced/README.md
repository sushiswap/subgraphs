# V3 Reduced Subgraph

Reduced, data-api-focused SushiSwap V3 subgraph. It preserves pool discovery,
TVL, volume, transaction entities, USD pricing, and pool/protocol time buckets
while omitting position, tick, token-bucket, and fee-growth indexing.

The package supports three builds from the same schema source:

- `generate:immutable-graft` keeps event entities immutable and declares the
  grafting feature. Goldsky has been verified to graft the mutable V3 entities
  into this immutable schema and continue indexing without errors.
- `generate:graft` creates a conservative fallback schema with mutable event
  entities.
- `generate` keeps event entities immutable. This is the clean deployment that
  can sync independently without grafting.

## Retained API

- Current pools: token addresses/metadata, fee tier, liquidity, price, tick,
  volume, TVL, transaction count, and protocol-fee status.
- Immutable Mint, Burn, Swap, and Collect events with their existing field
  names where data-api consumes them.
- Pool hourly/daily buckets and protocol daily buckets for volume, fees, TVL,
  and transaction counts.
- Internal whitelist-pool pricing state used to derive USD values.

## Removed indexing

- NonfungiblePositionManager, Position, and PositionSnapshot.
- Tick, TickDayData, and tick-crossing contract reads.
- Pool and bucket fee-growth fields and their per-event contract reads.
- TokenDayData and TokenHourData.
- Flash, unused token aggregates, and unused pool/bucket fields.

Swap handlers perform no contract calls. Pool creation reads `symbol()`,
`name()`, `totalSupply()`, and `decimals()` once for each token that has
not been indexed before.

## Robinhood graft deployment

Goldsky injects the graft base and block through `--graft-from`. The source is
the currently deployed `sushiswap/v3-robinhood`; no deployment ID or block is
stored in this repository.

```sh
NETWORK=robinhood pnpm --filter v3-reduced generate:immutable-graft
pnpm --filter v3-reduced build
goldsky subgraph deploy sushiswap/v3-reduced-robinhood \
  --path subgraphs/v3-reduced \
  --graft-from sushiswap/v3-robinhood
```

Without `--start-block`, Goldsky grafts from the latest indexed block of the
source deployment.

If immutable grafting is unavailable on another host, use `generate:graft`
with the same deployment command to produce the mutable fallback.

## Clean parallel deployment

The clean deployment must have a distinct Goldsky version while both are
running:

```sh
NETWORK=robinhood pnpm --filter v3-reduced generate
pnpm --filter v3-reduced build
goldsky subgraph deploy sushiswap/v3-reduced-robinhood-clean \
  --path subgraphs/v3-reduced \
  --remove-graft
```
