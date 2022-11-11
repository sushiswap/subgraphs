import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { SwapExactETHForTokensCall, SwapExactTokensForETHCall, SwapExactTokensForTokensCall } from '../../generated/Router/Router'
import { Swap } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO } from '../constants'
import { getOrCreateGlobal } from '../functions/global'
import { getOrCreateToken } from '../functions/token'


export function onSwapExactETHForTokens(call: SwapExactETHForTokensCall): void {
  handleSwap(call)
}


export function onSwapExactTokensForETH(call: SwapExactTokensForETHCall): void {
  handleSwap(call)
}

export function onSwapExactTokensForTokens(call: SwapExactTokensForTokensCall): void {
  handleSwap(call)
}


function handleSwap<T>(call: T): void {
  if (!(call instanceof SwapExactTokensForTokensCall || call instanceof SwapExactETHForTokensCall || call instanceof SwapExactTokensForETHCall)) {
    log.debug("handleSwap: call is not a SwapExactTokensForTokensCall, SwapExactTokensForETHCall or SwapExactETHForTokensCall", [])
    return
  }

  const amountOutMin = call.inputs.amountOutMin
  const amountOut = call.outputs.amounts[call.outputs.amounts.length - 1]
  const tokenInAddress = call.inputs.path[0]
  const tokenOutAddress = call.inputs.path[call.inputs.path.length - 1]
  const positiveSlippage = amountOut.minus(amountOutMin)

  getOrCreateToken(tokenInAddress.toHex())
  const tokenOut = getOrCreateToken(tokenOutAddress.toHex())
  tokenOut.positiveSlippage = tokenOut.positiveSlippage.plus(positiveSlippage)
  tokenOut.save()

  const global = getOrCreateGlobal()
  if (positiveSlippage.gt(BIG_INT_ZERO)) {
    global.positiveSlippageSwapCount = global.positiveSlippageSwapCount.plus(BIG_INT_ONE)
    global.totalSwapCount = global.totalSwapCount.plus(BIG_INT_ONE)
    global.save()
  } else {
    global.exactSwapCount = global.exactSwapCount.plus(BIG_INT_ONE)
    global.totalSwapCount = global.totalSwapCount.plus(BIG_INT_ONE)
    global.save()
  }


  const swap = new Swap(call.transaction.hash.toHex().concat('-').concat(call.transaction.index.toString()))
  swap.positiveSlippage = positiveSlippage
  swap.amountOut = amountOut
  swap.amountOutMin = amountOutMin
  swap.createdAtBlock = call.block.number
  swap.createdAtTimestamp = call.block.timestamp
  swap.tokenIn = tokenInAddress.toHex()
  swap.tokenOut = tokenOutAddress.toHex()
  swap.txFrom = call.transaction.from.toHex()
  if (call.transaction.to !== null) swap.txTo = call.transaction.to!.toHex()
  swap.to = call.inputs.to.toHex()
  swap.save()

}