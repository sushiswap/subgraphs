# Furo Vesting Subgraph

## Vesting schedule

The vesting schedule contains multiple `SchedulePeriod`s with different types(`START`, `CLIFF`, `STEP`, `END`).  
A Vesting with i.e. `Cliff` duration set to 1 year, followed up by biweekly payout for a year, could result in a schedule as following:  

| ID          | TYPE  | TIME       | AMOUNT    |
|-------------|-------|------------|-----------|
| 1:period:0  | START | 1648297495 |         0 |
| 1:period:1  | CLIFF | 1679833495 | 100000000 |
| 1:period:2  | STEP  | 1681043095 | 110000000 |
| 1:period:3  | STEP  | 1682252695 | 120000000 |
| 1:period:4  | STEP  | 1683462295 | 130000000 |
| 1:period:5  | STEP  | 1684671895 | 140000000 |
| 1:period:6  | STEP  | 1685881495 | 150000000 |
| 1:period:7  | STEP  | 1687091095 | 160000000 |
| 1:period:8  | STEP  | 1688300695 | 170000000 |
| 1:period:9  | STEP  | 1689510295 | 180000000 |
| 1:period:10 | STEP  | 1690719895 | 190000000 |
| 1:period:11 | STEP  | 1691929495 | 200000000 |
| 1:period:12 | STEP  | 1693139095 | 210000000 |
| 1:period:13 | STEP  | 1694348695 | 220000000 |
| 1:period:14 | STEP  | 1695558295 | 230000000 |
| 1:period:15 | STEP  | 1696767895 | 240000000 |
| 1:period:16 | STEP  | 1697977495 | 250000000 |
| 1:period:17 | STEP  | 1699187095 | 260000000 |
| 1:period:18 | STEP  | 1700396695 | 270000000 |
| 1:period:19 | STEP  | 1701606295 | 280000000 |
| 1:period:20 | STEP  | 1702815895 | 290000000 |
| 1:period:21 | STEP  | 1704025495 | 300000000 |
| 1:period:22 | STEP  | 1705235095 | 310000000 |
| 1:period:23 | STEP  | 1706444695 | 320000000 |
| 1:period:24 | STEP  | 1707654295 | 330000000 |
| 1:period:25 | STEP  | 1708863895 | 340000000 |
| 1:period:26 | STEP  | 1710073495 | 350000000 |
| 1:period:27 | END   | 1711283095 | 360000000 |

## Unit testing

### Run

```sh
yarn graph test <ONE-OR-MORE-TEST-NAMES>

yarn graph test Vesting
```
