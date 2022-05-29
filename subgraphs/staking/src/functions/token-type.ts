import { Address, log } from '@graphprotocol/graph-ts'
import { KashiPair } from '../../generated/Staking/KashiPair'
import { ConstantProductPool } from '../../generated/Staking/ConstantProductPool'
import { ERC20 } from '../../generated/Staking/ERC20'
import { Pair } from '../../generated/Staking/Pair'
import { ADDRESS_ZERO, KASHI_MEDIUM_RISK, SUSHISWAP_LP_TOKEN, SUSHI_LP_TOKEN } from '../constants/index'
import { getTokenSymbol, Name, Symbol } from './token'

export function getPairSymbol(name: Name, tokenAddress: Address): Symbol {
  const farmType = getTokenType(name.value)
  if (farmType === TokenType.LEGACY) {
    return createLegacyPairSymbol(tokenAddress)
  } else if (farmType === TokenType.TRIDENT) {
    return createTridentPairSymbol(tokenAddress)
  } else if (farmType === TokenType.KASHI) {
    return createKashiPairSymbol(tokenAddress)
  } else {
    return { success: false, value: '???' }
  }
}

function createLegacyPairSymbol(tokenAddress: Address): Symbol {
  const contract = Pair.bind(tokenAddress)
  const token0Address = contract.try_token0()
  const token1Address = contract.try_token1()
  if (!token0Address.reverted && !token1Address.reverted) {
    return getTokensSymbol(token0Address.value, token1Address.value)
  } else {
    return { success: false, value: '???' }
  }
}

function createTridentPairSymbol(tokenAddress: Address): Symbol {
  const contract = ConstantProductPool.bind(tokenAddress)
  const token0Address = contract.try_token0()
  const token1Address = contract.try_token1()
  if (!token0Address.reverted && !token1Address.reverted) {
    return getTokensSymbol(token0Address.value, token1Address.value)
  } else {
    return { success: false, value: '???' }
  }
}

function createKashiPairSymbol(tokenAddress: Address): Symbol {
  const contract = KashiPair.bind(tokenAddress)
  const token0Address = contract.try_asset()
  const token1Address = contract.try_collateral()
  if (
    !token0Address.reverted &&
    token0Address.value != ADDRESS_ZERO &&
    !token1Address.reverted &&
    token1Address.value != ADDRESS_ZERO
  ) {
    return getTokensSymbol(token0Address.value, token1Address.value)
  } else {
    return { success: false, value: '???' }
  }
}

function getTokensSymbol(token0Address: Address, token1Address: Address): Symbol {
  const token0Contract = ERC20.bind(token0Address)
  const token1Contract = ERC20.bind(token1Address)
  const token0Symbol = getTokenSymbol(token0Contract)
  const token1Symbol = getTokenSymbol(token1Contract)

  return token0Symbol.success && token1Symbol.success
    ? { success: true, value: token0Symbol.value.concat('/').concat(token1Symbol.value) }
    : { success: false, value: '???' }
}

export function getTokenType(name: string): TokenType {
  if (name == SUSHI_LP_TOKEN) return TokenType.TRIDENT
  else if (name == SUSHISWAP_LP_TOKEN) return TokenType.LEGACY
  else if (name.startsWith(KASHI_MEDIUM_RISK)) return TokenType.KASHI
  else return TokenType.TOKEN
}

export enum TokenType {
  TRIDENT,
  LEGACY,
  KASHI,
  TOKEN,
}
