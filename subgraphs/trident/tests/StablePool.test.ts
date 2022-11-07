import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { Pair, Token } from '../generated/schema'
import { STABLE_POOL_FACTORY_ADDRESS } from '../src/constants'
import { onDeployPool } from '../src/mappings/master-deployer'
import { onSync } from '../src/mappings/pair'
import { createPairEvent, createSyncEvent, getOrCreateRebaseMock, getOrCreateTokenMock } from './mocks'


test('Price test', () => {

    let pair = deployPair({
        factory: STABLE_POOL_FACTORY_ADDRESS,
        token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
        token0Decimals: 6,
        token0Symbol: "USDC",
        token0Name: "USD Coin",
        token1: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
        token1Decimals: 6,
        token1Symbol: "USDT",
        token1Name: "USD Tether",
        pairAddress: Address.fromString("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
    })

    const blockNumber = BigInt.fromString("13413298")
    const reserve0 = BigInt.fromString("5028472782")
    const reserve1 = BigInt.fromString("5028350937")
    const syncEvent = createSyncEvent(
        Bytes.fromHexString("0xcd18330c23ba51da48581d11d43db76fe3c4502af0a49dc7667a9b65c2546c9f"),
        blockNumber,
        Address.fromString(pair.id),
        reserve0,
        reserve1)

    onSync(syncEvent)

    assert.fieldEquals('Pair', pair.id, 'token0Price', '0.9999999999999996')
    assert.fieldEquals('Pair', pair.id, 'token1Price', '1.0000000000000004')


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