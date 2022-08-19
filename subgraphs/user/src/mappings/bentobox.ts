import { Product } from "../constants";
import { handleUser } from "../functions";
import { LogDeposit, LogFlashLoan, LogSetMasterContractApproval, LogTransfer, LogWithdraw } from "../../generated/BentoBox/BentoBox";

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

export function onLogFlashloan(event: LogFlashLoan): void {
    handleUser(event.params.borrower, event, Product.BENTOBOX)
}