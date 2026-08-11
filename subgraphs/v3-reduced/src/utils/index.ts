/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Transaction } from "../../generated/schema";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../constants";

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let result = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
    result = result.times(BigDecimal.fromString("10"));
  }
  return result;
}

export function safeDiv(
  numerator: BigDecimal,
  denominator: BigDecimal
): BigDecimal {
  return denominator.equals(ZERO_BD) ? ZERO_BD : numerator.div(denominator);
}

export function convertTokenToDecimal(
  amount: BigInt,
  decimals: BigInt
): BigDecimal {
  return decimals.equals(ZERO_BI)
    ? amount.toBigDecimal()
    : amount.toBigDecimal().div(exponentToBigDecimal(decimals));
}

export function isNullEthValue(value: string): boolean {
  return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}

// Transactions are immutable shared envelopes. Multiple pool events in the
// same transaction reuse the first entity instead of rewriting identical data.
export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString());
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString());
    transaction.blockNumber = event.block.number;
    transaction.timestamp = event.block.timestamp;
    transaction.save();
  }
  return transaction as Transaction;
}
