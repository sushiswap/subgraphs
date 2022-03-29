# TODO:s

- [  ] Setup config for kovan and mainnet once the contracts are deployed
- [  ] Manual testing: Populate contract with data and query it, compare values with the public contract functions
  - [  ] query derived fields (cannot be test with unit tests, virtual fields..)
  - [  ] Review fields on `Transaction` entity: `toBentoBox` and `fromBentoBox`, might need negation to be set correctly.
  - [  ] Consider if needed: When a stream is updated, the streams amount is updated, but currently no historical data saved for this. (Could it be saved in the Transaction?)
  