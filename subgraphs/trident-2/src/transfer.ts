import { BigInt, log, store } from '@graphprotocol/graph-ts'
import { Burn, Mint } from '../generated/schema'
import { Transfer as TransferEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { ADDRESS_ZERO } from './constants'
import { getOrCreateBurn, getOrCreateLiquidityPosition, getOrCreateMint, getOrCreateTransaction } from './functions'
import { createLiquidityPositionSnapshot } from './functions/liquidity-position-snapshot'

export function isInitialTransfer(event: TransferEvent): boolean {
  return event.params.recipient == ADDRESS_ZERO && event.params.amount.equals(BigInt.fromI32(1000))
}

export function isMint(event: TransferEvent): boolean {
  return event.params.sender == ADDRESS_ZERO
}

export function isBurn(event: TransferEvent): boolean {
  return event.params.recipient == ADDRESS_ZERO
}

export function isDirectTransfer(event: TransferEvent): boolean {
  return event.params.recipient.toHex() == event.address.toHex()
}

export function handleTransferMintBurn(event: TransferEvent): void {
  if (isInitialTransfer(event)) {
    return
  }

  let transaction = getOrCreateTransaction(event)
  const mints = transaction.mints
  const burns = transaction.burns

  if (isMint(event)) {
    if (transaction.mints.length == 0 || isMintingComplete(mints[mints.length - 1])) {
      let mint = getOrCreateMint(event, mints.length)
      transaction.mints = mints.concat([mint.id])
      transaction.save()
    }
  } else if (isDirectTransfer(event)) {
    let burn = getOrCreateBurn(event, transaction.burns.length)
    transaction.burns = transaction.burns.concat([burn.id])
    transaction.save()
  } else if (isBurn(event)) {
    let burn: Burn | null = null

    if (transaction.burns.length) {
      burn = Burn.load(burns[burns.length - 1])
    }

    // If no burn or burn complete, create new burn
    if (burn === null || burn.complete) {
      burn = getOrCreateBurn(event, burns.length)
    }

    // if this logical burn included a fee mint, account for this
    if (mints.length != 0 && !isMintingComplete(mints[mints.length - 1])) {
      const mint = Mint.load(mints[mints.length - 1])

      if (mint === null) {
        return
      }

      burn.feeTo = mint.to
      burn.feeLiquidity = mint.liquidity

      // remove the logical mint
      store.remove('Mint', mints[mints.length - 1])

      // update the transaction
      transaction.mints = mints.slice(0, -1)
      transaction.save()
    }

    burn.save()

    if (!burn.complete) {
      // Burn is not complete, replace previous tail
      transaction.burns = burns.slice(0, -1).concat([burn.id])
    } else {
      // Burn is complete, concat to transactions
      transaction.burns = burns.concat([burn.id])
    }

    transaction.save()
  }
}

export function createLiquidityPositions(event: TransferEvent): void {
  if (isInitialTransfer(event)) {
    return
  }

  if (isBurn(event)) {
    const fromUserLiquidityPosition = getOrCreateLiquidityPosition(event.params.sender, event.address, event.block)
    fromUserLiquidityPosition.balance = fromUserLiquidityPosition.balance.minus(event.params.amount)
    fromUserLiquidityPosition.save()
    createLiquidityPositionSnapshot(fromUserLiquidityPosition, event.block)
  }

  if (isMint(event)) {
    const toUserLiquidityPosition = getOrCreateLiquidityPosition(event.params.recipient, event.address, event.block)
    toUserLiquidityPosition.balance = toUserLiquidityPosition.balance.plus(event.params.amount)
    toUserLiquidityPosition.save()
    createLiquidityPositionSnapshot(toUserLiquidityPosition, event.block)
  }
}

function isMintingComplete(mintId: string): boolean {
  const mint = Mint.load(mintId)
  return !mint || mint.sender !== null
}
