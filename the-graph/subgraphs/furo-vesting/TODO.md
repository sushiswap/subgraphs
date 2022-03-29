# TODO:s

- [  ] Setup config for kovan and mainnet once the contracts are deployed
- [  ] Manual testing: Populate contract with data and query it, compare values with the public contract functions
  - [  ] query derived fields (cannot be test with unit tests, virtual fields..)
- [  ] Review fields on `Transaction` entity: `toBentoBox` and `fromBentoBox`, might need negation to be set correctly.
- [  ] The current implementation expects the contracts `step` variable to become limited to a reasonable size, it's possible to create a vesting with steps=4294967295, which would create 4294967295 `SchedulePeriod` entities.  
