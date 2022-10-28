import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/Factory/ERC20'
import { NameBytes32 } from '../../generated/Factory/NameBytes32'
import { SymbolBytes32 } from '../../generated/Factory/SymbolBytes32'
import { Token } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO } from '../constants'
import { getOrCreateFactory } from './factory'
import { StaticTokenDefinition } from './staticTokenDefinition'
import { createTokenPrice } from './token-price'

export function getOrCreateToken(id: string): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)
    createTokenPrice(id)

    const contractAddress = Address.fromString(id)

    const decimals = getTokenDecimals(contractAddress)
    const name = getTokenName(contractAddress)
    const symbol = getTokenSymbol(contractAddress)
    token.price = id
    token.name = name.value
    token.nameSuccess = name.success
    token.symbol = symbol.value
    token.symbolSuccess = symbol.success
    token.decimals = decimals.value
    token.decimalsSuccess = decimals.success

    token.liquidity = BIG_INT_ZERO
    token.liquidityNative = BIG_DECIMAL_ZERO
    token.liquidityUSD = BIG_DECIMAL_ZERO
    token.volume = BIG_DECIMAL_ZERO
    token.volumeNative = BIG_DECIMAL_ZERO
    token.volumeUSD = BIG_DECIMAL_ZERO
    token.feesNative = BIG_DECIMAL_ZERO
    token.feesUSD = BIG_DECIMAL_ZERO
    token.txCount = BIG_INT_ZERO
    token.pairCount = BIG_INT_ZERO

    token.save()
    const factory = getOrCreateFactory()
    factory.tokenCount = factory.tokenCount.plus(BIG_INT_ONE)
    factory.save()
  }

  return token as Token
}

class Symbol {
  success: boolean
  value: string
}

export function getTokenSymbol(tokenAddress: Address): Symbol {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = SymbolBytes32.bind(tokenAddress)
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
  if (staticTokenDefinition != null) {
    return { success: true, value: staticTokenDefinition.symbol }
  }

  let symbolResult = contract.try_symbol()

  if (!symbolResult.reverted) {
    return { success: true, value: symbolResult.value.toString() }
  }

  let symbolResultBytes = contractSymbolBytes.try_symbol()
  if (!symbolResultBytes.reverted && symbolResultBytes.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001') {
    return { success: true, value: symbolResultBytes.value.toString() }
  }

  return { success: false, value: '???' }
}



class Name {
  success: boolean
  value: string
}

export function getTokenName(tokenAddress: Address): Name {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = NameBytes32.bind(tokenAddress)
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)

  if (staticTokenDefinition != null) {
    return { success: true, value: staticTokenDefinition.name }
  }

  let nameResult = contract.try_name()

  if (!nameResult.reverted) {
    return { success: true, value: nameResult.value.toString() }
  }

  let nameResultBytes = contractNameBytes.try_name()
  if (!nameResultBytes.reverted && nameResultBytes.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001') {
    return { success: true, value: nameResultBytes.value.toString() }
  }


  return { success: false, value: '???' }
}


class Decimal {
  success: boolean
  value: BigInt
}


export function getTokenDecimals(tokenAddress: Address): Decimal {
  let contract = ERC20.bind(tokenAddress)
  let decimalResult = contract.try_decimals()
  let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
  
  if (staticTokenDefinition != null) {
    return { success: true, value: staticTokenDefinition.decimals }
  }

  if (!decimalResult.reverted) {
    return { success: true, value: BigInt.fromI32(decimalResult.value) }
  }


  return { success: false, value: BigInt.fromI32(18) }
}



const BLACKLIST_EXCHANGE_VOLUME: string[] = [
  '0x9ea3b5b4ec044b70375236a281986106457b20ef', // DELTA
]

export function isBlacklistedToken(token: string): boolean {
  return BLACKLIST_EXCHANGE_VOLUME.includes(token)
}