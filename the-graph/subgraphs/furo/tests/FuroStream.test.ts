import { Address } from '@graphprotocol/graph-ts'
import { clearStore, test } from 'matchstick-as/assembly/index'

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')

function setup(): void {
}

function cleanup(): void {
  clearStore()
}

test("test", () => {
  setup()


  cleanup()
})
