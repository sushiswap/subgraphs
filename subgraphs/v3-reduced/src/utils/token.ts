/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/Factory/ERC20";
import { ERC20NameBytes } from "../../generated/Factory/ERC20NameBytes";
import { ERC20SymbolBytes } from "../../generated/Factory/ERC20SymbolBytes";
import { NETWORK, ZERO_BI } from "../constants";
import { isNullEthValue } from ".";
import { StaticTokenDefinition } from "./staticTokenDefinition";

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();

  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString();
      } else {
        let definition = StaticTokenDefinition.fromAddress(tokenAddress);
        if (definition !== null) {
          symbolValue = definition.symbol;
        }
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);
  let nameValue = "unknown";
  let nameResult = contract.try_name();

  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString();
      } else {
        let definition = StaticTokenDefinition.fromAddress(tokenAddress);
        if (definition !== null) {
          nameValue = definition.name;
        }
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let result = ERC20.bind(tokenAddress).try_totalSupply();
  return result.reverted ? ZERO_BI : result.value;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let result = ERC20.bind(tokenAddress).try_decimals();
  if (!result.reverted) {
    return BigInt.fromI32(result.value);
  }

  if (NETWORK == "mainnet") {
    let definition = StaticTokenDefinition.fromAddress(tokenAddress);
    if (definition !== null) {
      return definition.decimals;
    }
  }

  // Match the existing v3 behavior for non-standard tokens.
  return BigInt.fromI32(18);
}
