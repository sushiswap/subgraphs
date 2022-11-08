import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { afterAll, assert, beforeAll, clearStore, test } from 'matchstick-as/assembly/index'
import { Pair, Token } from '../generated/schema'
import { NATIVE_ADDRESS, STABLE_POOL_FACTORY_ADDRESS } from '../src/constants'
import { onDeployPool } from '../src/mappings/master-deployer'
import { onSync } from '../src/mappings/pair'
import { createPairEvent, createSyncEvent, getOrCreateRebaseMock, getOrCreateTokenMock } from './mocks'

class TestArg {
    reserve0: BigInt
    reserve1: BigInt
    expectedToken0Price: BigDecimal
    expectedToken1Price: BigDecimal
}
const TEST_ARGS: TestArg[] =
    [
        {
            reserve0: BigInt.fromString("5028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.9999999999999996'), expectedToken1Price: BigDecimal.fromString('1.0000000000000005')
        },
        {
            reserve0: BigInt.fromString("6028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.9985211822128942'), expectedToken1Price: BigDecimal.fromString('1.0014810079279726')
        },
        {
            reserve0: BigInt.fromString("7028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.9909106664191369'), expectedToken1Price: BigDecimal.fromString('1.0091727073780619')
        },
        {
            reserve0: BigInt.fromString("8028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.976026791175519'), expectedToken1Price: BigDecimal.fromString('1.0245620397321347')
        }
        ,
        {
            reserve0: BigInt.fromString("9028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.9549463914654022'), expectedToken1Price: BigDecimal.fromString('1.0471792018245772')
        }
        ,
        {
            reserve0: BigInt.fromString("10028472782"), reserve1: BigInt.fromString("5028472782"),
            expectedToken0Price: BigDecimal.fromString('0.9293374369128773'), expectedToken1Price: BigDecimal.fromString('1.0760354208067345')
        }
        ,
        {
            reserve0: BigInt.fromString("5028472782"), reserve1: BigInt.fromString("7028472782"),
            expectedToken0Price: BigDecimal.fromString('1.0091727073780619'), expectedToken1Price: BigDecimal.fromString('0.9909106664191369')
        }
    ]

const PAIR = Address.fromString("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
// beforeAll(() => {
//     getOrCreateTokenMock(NATIVE_ADDRESS, 18, "NATIVE", "NAT")
//     let pair = 
// })

// afterAll(() => {
//     clearStore()
// })

test(`Pair.token0/1.price test`, () => {
    // const i = 0
    for (let i = 0; i < TEST_ARGS.length; i++) {

        getOrCreateTokenMock(NATIVE_ADDRESS, 18, "NATIVE", "NAT")
        deployPair({
            factory: STABLE_POOL_FACTORY_ADDRESS,
            token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
            token0Decimals: 18,
            token0Symbol: "SomeToken",
            token0Name: "Some Token",
            token1: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
            token1Decimals: 18,
            token1Symbol: "SomeOtherToken",
            token1Name: "Some Other Token",
            pairAddress: PAIR
        })
        const blockNumber = BigInt.fromString("13413298")
        const syncEvent = createSyncEvent(Bytes.fromHexString("0xcd18330c23ba51da48581d11d43db76fe3c4502af0a49dc7667a9b65c2546c9f"), blockNumber, PAIR, TEST_ARGS[i].reserve0, TEST_ARGS[i].reserve1)

        onSync(syncEvent)

        assert.fieldEquals('Pair', PAIR.toHex(), 'token0Price', TEST_ARGS[i].expectedToken0Price.toString())
        assert.fieldEquals('Pair', PAIR.toHex(), 'token1Price', TEST_ARGS[i].expectedToken1Price.toString())

        log.debug("Test {} reserve0: {} reserve1: {}, expected token0Price: {}, token1Price: {}", [(i+1).toString(), TEST_ARGS[i].reserve0.toString(), TEST_ARGS[i].reserve1.toString(), TEST_ARGS[i].expectedToken0Price.toString(), TEST_ARGS[i].expectedToken1Price.toString()])
        log.debug("Test {} passed", [(i + 1).toString()])

    }
})




function deployPair(args: DeployPairArgs): Pair {
    let tupleArray: Array<ethereum.Value> = [
        ethereum.Value.fromAddress(args.token0),
        ethereum.Value.fromAddress(args.token1),
        ethereum.Value.fromSignedBigInt(BigInt.fromString("30000"))
    ]

    let tuple = changetype<ethereum.Tuple>(tupleArray)

    const deployData = ethereum.encode(ethereum.Value.fromTuple(tuple))!

    if (Token.load(args.token0.toHex()) == null) {
        getOrCreateRebaseMock(args.token0, BigInt.fromString("1"), BigInt.fromString("1"))
        getOrCreateTokenMock(args.token0.toHex(), args.token0Decimals, args.token0Name, args.token0Symbol)
    }
    if (Token.load(args.token1.toHex()) == null) {
        getOrCreateRebaseMock(args.token1, BigInt.fromString("1"), BigInt.fromString("1"))
        getOrCreateTokenMock(args.token1.toHex(), args.token1Decimals, args.token1Name, args.token1Symbol)
    }
    const pairCreatedEvent = createPairEvent(args.factory, args.pairAddress, deployData)
    onDeployPool(pairCreatedEvent)
    return Pair.load(args.pairAddress.toHexString()) as Pair
}
class DeployPairArgs {
    factory: Address
    token0: Address
    token0Decimals: i32
    token0Symbol: string
    token0Name: string
    token1: Address
    token1Decimals: i32
    token1Symbol: string
    token1Name: string
    pairAddress: Address
}