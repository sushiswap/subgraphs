# Sushi Launchpad Subgraph

Canonical, event-driven projection of Sushi Launchpad factories. Market swaps,
prices, candles, TVL, and volume stay in the existing Sushi V3 subgraph and the
data-api market projection.

## Entities

- `Launchpad` stores one factory deployment, its current protocol recipient,
  native launch fee, default Sushi fee, protocol reserve settings, and
  aggregate token, creator, and position counts.
- `Creator` provides the per-Launchpad identity needed to count distinct
  creators and links each creator to their tokens.
- `Token` stores ERC-20 metadata, its creator, current Sushi fee, reserve state,
  cumulative fee amounts, and its pool.
- `Pool` stores the immutable V3 configuration (`token0`, `token1`, fee, tick
  spacing, and position manager) and links to its initial launch positions.
- `LaunchPosition` stores only the V3 NFTs minted in the token launch
  transaction. Desired and used amounts are normalized to `amount0` and
  `amount1` according to the pool's canonical token ordering.
- `FeeDistribution` stores each collection and split with both recipients and
  all token0/token1 amounts. `ReserveWithdrawal` records the token's one
  protocol-reserve withdrawal.
- `LaunchFeeWithdrawal` stores each withdrawal of accumulated native launch
  fees with its amount and recipient.

`Pool.positionCount` also reconciles the ordered `PositionCreated` events with
the final `TokenLaunched.positionCount`. No temporary accumulator entity is
needed: the pool and positions are permanent domain records even though the
contract emits `TokenLaunched` last.

Every stable entity ID is chain-scoped even though each deployment indexes one
network. Addresses are stored as `Bytes`, whose GraphQL representation is
normalized lowercase hexadecimal.

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

All deployments on a network share the schema and mappings. The mapping reads
the quote token, position manager, protocol recipient, launch fee, and initial
defaults from the Launchpad contract, then reads canonical token ordering, fee,
and tick spacing from each created V3 pool. Add old and new factory versions to
the array during a rotation; do not replace historical entries. Keep the first
historical data source named `SushiLaunchpad`; the shared mapping imports its
generated ABI bindings, while later entries use unique names such as
`SushiLaunchpadV2`.

The mapping is split by responsibility: `helpers.ts` owns chain-scoped IDs and
entity loading, `token.ts` owns token/pool/position and token-level flows, and
`launchpad.ts` owns factory-wide settings and provides the manifest exports.

Robinhood currently contains a zero-address build placeholder because the
production factory address and deployment block are still an explicit launch
gate in the contract specification. Replace both values before deployment.

## Development

```sh
NETWORK=robinhood pnpm generate
pnpm build
pnpm test
```

`abis/SushiLaunchpad.json` is pinned from the current contract artifact in the
`sushi-launchpad` repository. Refresh it together with mappings and tests when
an indexed event changes.
