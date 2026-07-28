# Sushi Launchpad Subgraph

Canonical, event-driven projection of Sushi Launchpad factories. Market swaps,
prices, candles, TVL, and volume stay in the existing Sushi V3 subgraph and the
data-api market projection.

## Entities

- `Launchpad` stores one factory deployment, its current protocol recipient,
  native launch fee, initial USD FDV, default Sushi fee, protocol reserve
  settings, position manager, deployment-scoped launch token/pool metadata, and
  current per-quote-token price feeds. Setting a feed to the zero address
  removes that quote token from the current allowlist projection.
- `Launch` is the canonical current projection for one launched token. It
  embeds the current and initial creator, token metadata/economics, pricing
  inputs and the factory's initial FDV, aligned start tick, canonical launch
  pool, and its one V3 position.
- `PendingLaunch` is an internal two-log accumulator. `TokenLaunched` creates
  it; the same transaction's following `PositionCreated` validates it, creates
  the complete `Launch`, and removes it. Canonical `Launch` consumers therefore
  never observe a falsely complete or positionless record.
- `CreatorTransfer`, `InitialBuy`, `FeeDistribution`, `ReserveWithdrawal`, and
  `LaunchFeeWithdrawal` preserve immutable lifecycle/history events and point
  directly to their `Launch` or `Launchpad`.

The `pool` embedded in `Launch` is specifically the immutable pool created for
that launch. A token can have other V3 pools, and downstream market projections
must continue to key pool-specific metrics and trades by pool address rather
than treating the token as one market.

Exactly four getters are invoked on the first launch for each Launchpad
deployment: `decimals()` and `totalSupply()` on the launched ERC-20, plus
`fee()` and `tickSpacing()` on the emitted canonical V3 pool. The observed
values are cached on `Launchpad`; every later launch from that deployment
reuses the cache with zero token or pool getter calls. `PositionCreated` copies
the cached values into the completed `Launch`, so `PendingLaunch` only carries
the event-sourced data needed to join the two launch logs.
Initial FDV remains factory-sourced: it is read from the Launchpad contract
when the factory projection is initialized and copied to every `Launch`.
Canonical token ordering is derived from the two emitted addresses without
calling `token0()` or `token1()`.

Every stable entity ID is chain-scoped even though each deployment indexes one
network. Every stored Ethereum address and hash uses its unsuffixed field name
and is a canonical lowercase, `0x`-prefixed `String`. This avoids
connector-specific binary encodings such as PostgreSQL bytea's `\x` prefix and
gives downstream text columns one unambiguous representation.

## Configuration

Each `config/<network>.js` file may register multiple current or historical
factory deployments:

```js
launchpad: {
  deployments: [
    {
      name: "SushiLaunchpadV1",
      chainId: 4663,
      address: "0x...",
      startBlock: 123,
    },
  ],
}
```

All deployments on a network share the schema and mappings. A quote token is
selected independently for each launch and persisted on its `Launch` entity.
The subgraph indexes every valid quote token emitted by the contract; public
allowlisting and market filtering belong downstream in data-api. The mapping
reads the position manager, protocol recipient, launch fee, initial FDV, and
initial defaults from the Launchpad contract. It derives canonical token
ordering from emitted addresses and observes immutable token and pool values
only for the first launch of each factory deployment. Add old and new factory
versions to the array during a rotation; each deployment has its own metadata
cache, so its first launch makes four getter calls and subsequent launches make
none. Do not replace historical entries. Keep the first historical data source
named `SushiLaunchpad`; the shared mapping imports its generated ABI bindings,
while later entries use unique names such as `SushiLaunchpadV2`.

The mapping is split by responsibility: `mapping.ts` is the thin manifest
entrypoint; `launch-lifecycle.ts`, `launch-state.ts`, and `launch-activity.ts`
own the launch aggregate; `launch-invariants.ts` owns the typed deployment
cache and its one-time contract reads; `launchpad.ts` owns factory
configuration; and `shared.ts` owns chain-scoped IDs and entity loading.

Robinhood is configured for the SushiLaunchpad v1 production deployment at
`0x104F1Ab42674565EC3DF0BFEbCcC4186f72fA7ED`, starting at block `21957383`.

## Goldsky deployment

Generate and validate the Robinhood manifest, then deploy it to the existing
`sushiswap` Goldsky project:

```sh
NETWORK=robinhood pnpm --filter launchpad generate
pnpm --filter launchpad build
goldsky subgraph deploy sushiswap/launchpad-robinhood \
  --path subgraphs/launchpad/build \
  --description "Sushi Launchpad on Robinhood with canonical address strings"
```

The generated `subgraph.yaml` and `build/` output are ignored build artifacts;
regenerate them after checking out a fresh tree.

## Development

```sh
NETWORK=robinhood pnpm generate
pnpm build
pnpm test
```

`abis/SushiLaunchpad.json` is ABI-equivalent to the current compiled
`SushiLaunchpad` artifact in the sibling contract checkout. Refresh it together
with mappings and tests whenever an indexed event changes; the E2E harness
rejects ABI drift before starting a scenario.

## Local end-to-end test

The E2E harness runs the real Launchpad and launched token contracts against a
Hardhat chain, indexes their events with a local Graph Node, and compares every
entity with an independently constructed expected projection. The Sushi V3
factory, pools, position manager, and per-launch quote tokens use the contract
repository's behavioral mocks so fee collection and canonical token ordering
remain fast and deterministic.

Prerequisites:

- Node.js 24 and pnpm/Corepack;
- Docker with either the Compose plugin or the `docker-compose` command;
- a sibling `sushi-launchpad` checkout with dependencies installed. From this
  package, the default location resolves to `../../../sushi-launchpad`.

Run the default deterministic matrix:

```sh
pnpm test:e2e
```

The deterministic planner and Node.js harness can be checked without starting
Docker or Hardhat:

```sh
pnpm test:e2e:planner
pnpm test:e2e:typecheck
```

Reproduce one scenario or point to a different contract checkout:

```sh
pnpm test:e2e -- --seed 202
LAUNCHPAD_CONTRACTS_DIR=/path/to/sushi-launchpad pnpm test:e2e -- --seed 202
```

The default seeds are `101`, `202`, and `303`. Each scenario is fully prepared
before transactions are sent and varies actors, plain launches versus atomic
initial buys, fees, canonical token ordering, and valid action ordering while
guaranteeing coverage of every indexed lifecycle event. The first launch and
factory-default changes are mined in one block to exercise Graph Node's
block-visible contract-call semantics.

The runner requires ports `8545`, `8000`, `8001`, `8020`, `8030`, `8040`,
`5001`, and `5432`. It fails before startup if any are occupied. On success or
failure it stops Hardhat and removes the E2E containers and volumes. Plans,
transaction traces, GraphQL snapshots, expected projections, and service logs
are retained in the ignored `.e2e-artifacts/` directory; the failing seed and
artifact path are printed for reproduction.

The harness uses its own minimal Hardhat node configuration targeting Cancun
with a 60M block and transaction gas cap. Cancun matches the contracts' compile
target while avoiding newer per-transaction protocol caps below Graph Node's
50M historical contract-call allowance. The contract repository's development
and production config remains unchanged.
