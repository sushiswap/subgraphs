# TODO:s

- [  ] Setup config for kovan and mainnet once the contracts are deployed
- [  ] Review fields on `Transaction` mapping: event params `toBentoBox` and `fromBentoBox` - might need negation to be set correctly?
- [  ] The current implementation expects the contracts `step` variable to become limited to a reasonable size, it's possible to create a vesting with steps=4294967295, which would create 4294967295 `SchedulePeriod` entities.  
