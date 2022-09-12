# Staking Subgraph

![Staking Subgraph](../../images/staking_subgraph.png)

## Unit testing

### Run

All tests

```bash
pnpm exec turbo run test --scope=staking
```

Single test

```bash
pnpm exec turbo run test --scope=staking -- <TEST>
```

NOTE:  
The `-r` flag is short for `--recompile`. The default behavior of matchstick used to be to recompile every time and is now changed to only recompile on changes made to a test file, therefore it's a safer bet to always use it for the time being.
