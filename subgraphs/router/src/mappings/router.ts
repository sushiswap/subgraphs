import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { SwapExactETHForTokensCall, SwapExactTokensForETHCall, SwapExactTokensForTokensCall } from '../../generated/Router/Router'
import { Swap } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO } from '../constants'
import { getOrCreateGlobal } from '../functions/global'
import { getOrCreateToken } from '../functions/token'


export function onSwapExactETHForTokens(call: SwapExactETHForTokensCall): void {
  const amountOutMin = call.inputs.amountOutMin
  const amountOut = call.outputs.amounts[call.outputs.amounts.length - 1]
  const tokenInAddress = call.inputs.path[0]
  const tokenOutAddress = call.inputs.path[call.inputs.path.length - 1]

  handleSwap(amountOutMin, amountOut, tokenInAddress, tokenOutAddress, call)
}


export function onSwapExactTokensForETH(call: SwapExactTokensForETHCall): void {
  const amountOutMin = call.inputs.amountOutMin
  const amountOut = call.outputs.amounts[call.outputs.amounts.length - 1]
  const tokenInAddress = call.inputs.path[0]
  const tokenOutAddress = call.inputs.path[call.inputs.path.length - 1]

  handleSwap(amountOutMin, amountOut, tokenInAddress, tokenOutAddress, call)
}

export function onSwapExactTokensForTokens(call: SwapExactTokensForTokensCall): void {

  const amountOutMin = call.inputs.amountOutMin
  const amountOut = call.outputs.amounts[call.outputs.amounts.length - 1]
  const tokenInAddress = call.inputs.path[0]
  const tokenOutAddress = call.inputs.path[call.inputs.path.length - 1]

  handleSwap(amountOutMin, amountOut, tokenInAddress, tokenOutAddress, call)
}


function handleSwap(amountOutMin: BigInt, amountOut: BigInt, tokenInAddress: Address, tokenOutAddress: Address, call: ethereum.Call): void {
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
  swap.save()

}