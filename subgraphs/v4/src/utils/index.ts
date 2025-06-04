import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { Transaction } from '../../generated/schema'
import { ONE_BD, ZERO_BD, ZERO_BI } from '../constants'

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let resultString = '1'

  for (let i = 0; i < decimals.toI32(); i++) {
    resultString += '0'
  }

  return BigDecimal.fromString(resultString)
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD)) {
    return ZERO_BD
  } else {
    return amount0.div(amount1)
  }
}

export function hexToBigInt(hex: string): BigInt {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2)
  }
  let decimal = '0'
  for (let i = 0; i < hex.length; i++) {
    decimal = BigInt.fromString(decimal)
      .times(BigInt.fromI32(16))
      .plus(BigInt.fromI32(parseInt(hex.charAt(i), 16) as i32))
      .toString()
  }
  return BigInt.fromString(decimal)
}

/**
 * Implements exponentiation by squaring
 * (see https://en.wikipedia.org/wiki/Exponentiation_by_squaring )
 * to minimize the number of BigDecimal operations and their impact on performance.
 */
export function fastExponentiation(value: BigDecimal, power: i32): BigDecimal {
  if (power < 0) {
    const result = fastExponentiation(value, -power)
    return safeDiv(ONE_BD, result)
  }

  if (power == 0) {
    return ONE_BD
  }

  if (power == 1) {
    return value
  }

  const halfPower = power / 2
  const halfResult = fastExponentiation(value, halfPower)

  // Use the fact that x ^ (2n) = (x ^ n) * (x ^ n) and we can compute (x ^ n) only once.
  let result = halfResult.times(halfResult)

  // For odd powers, x ^ (2n + 1) = (x ^ 2n) * x
  if (power % 2 == 1) {
    result = result.times(value)
  }
  return result
}

const NULL_ETH_HEX_STRING = '0x0000000000000000000000000000000000000000000000000000000000000001'

export function isNullEthValue(value: string): boolean {
  return value == NULL_ETH_HEX_STRING
}
export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
  }
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.gasUsed = BigInt.zero() //needs to be moved to transaction receipt
  transaction.gasPrice = event.transaction.gasPrice
  transaction.save()
  return transaction as Transaction
}
