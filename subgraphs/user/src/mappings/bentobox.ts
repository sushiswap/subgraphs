import { Product } from "../constants";
import { handleUser } from "../functions";
import { LogDeploy, LogDeposit, LogFlashLoan, LogSetMasterContractApproval, LogTransfer, LogWithdraw } from "../../generated/BentoBox/BentoBox";
import { KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES } from "../constants";
import { KashiPair as KashiPairTemplate } from '../../generated/templates'

export function onLogDeposit(event: LogDeposit): void {
    handleUser(event.params.from, event, Product.BENTOBOX)
}

export function onLogWithdraw(event: LogWithdraw): void {
    handleUser(event.params.from, event, Product.BENTOBOX)
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
    handleUser(event.params.user, event, Product.BENTOBOX)
}

export function onLogTransfer(event: LogTransfer): void {
    handleUser(event.params.from, event, Product.BENTOBOX)
}

export function onLogFlashLoan(event: LogFlashLoan): void {
    handleUser(event.params.borrower, event, Product.BENTOBOX)
}


export function onLogDeploy(event: LogDeploy): void {
    if (KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES.includes(event.params.masterContract.toHex())) {
      KashiPairTemplate.create(event.params.cloneAddress)
    }
  }
  