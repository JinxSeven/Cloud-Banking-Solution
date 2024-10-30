import { inject, Injectable } from '@angular/core';
import { Transaction, UserDash } from '../interfaces/user-dash';
import { UserService } from './user.service';
import { NgForm } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    updateSignal: boolean = false;

    userService = inject(UserService);

    userDashData: UserDash[] = this.userService.getUserDashData();
    loggedIndx: number = this.userService.getLoggedIndx();
    loggedUserDashData: UserDash = this.userDashData[this.loggedIndx];

    updateDashBoardData() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    openTransactPopup(overlay: HTMLDivElement, newTransactPopup: HTMLDivElement) {
        overlay.style.display = "block";
        newTransactPopup.style.display = "block";
    }

    returnAptCategories(type: string): string[] {
        const expense: string[] = [
            "Entertainment",
            "Health",
            "Shopping",
            "Travel",
            "Education",
            "Other"
        ];
        const income :string[] = [
            "Salary",
            "Bonus",
            "Share",
            "Freelance",
            "Returns",
            "Other"
        ];
        if (type === "expense") return expense;
        else return income;
    }

    closeTransactionPopup(
        transactForm: NgForm,
        overlay: HTMLDivElement,
        transactPopup: HTMLDivElement
    ) {
        transactPopup.style.display = "none";
        transactForm.reset();
        overlay.style.display = "none";
    }

    addNewTransaction(
        newTransactForm: NgForm,
        overlay: HTMLDivElement,
        newTransactPopup: HTMLDivElement
    ) {
        this.updateDashBoardData();
        const newTransaction: Transaction = {
            type: newTransactForm.form.get('transactTypeSel')?.value,
            amount: parseInt(newTransactForm.form.get('transactAmt')?.value),
            category: newTransactForm.form.get('transactCateg')?.value,
            date: newTransactForm.form.get('transactDate')?.value,
            toOrFrom: newTransactForm.form.get('transactToOrFrom')?.value
        };
        this.loggedUserDashData.transactions.push(newTransaction);
        if (newTransaction.type === "expense") {
            this.loggedUserDashData.expense += newTransaction.amount;
        } else {
            this.loggedUserDashData.income += newTransaction.amount;
        }
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.closeTransactionPopup(newTransactForm, overlay, newTransactPopup);
        this.updateSignal = true;
    }

    updateTransaction(
        editTransactForm: NgForm,
        overlay: HTMLDivElement,
        editTransactPopup: HTMLDivElement,
        indx: number,
    ) {
        this.updateDashBoardData();

        let transactionToEdit = this.loggedUserDashData.transactions[indx];
        const newAmount: number = parseInt(editTransactForm.form.get('transactAmt')?.value);
        const oldAmount: number = transactionToEdit.amount;
        const difference: number = newAmount - oldAmount;

        const newType: string = editTransactForm.form.get('transactTypeSel')?.value;
        const oldType: string = transactionToEdit.type;

        if (newType === oldType) {
            if (newType === "income") {
                this.loggedUserDashData.income += difference;
            } else if (newType === "expense") {
                this.loggedUserDashData.expense += difference;
            }
        } else {
            if (oldType === "income" && newType === "expense") {
                this.loggedUserDashData.income -= oldAmount;
                this.loggedUserDashData.expense += newAmount;
            } else if (oldType === "expense" && newType === "income") {
                this.loggedUserDashData.expense -= oldAmount;
                this.loggedUserDashData.income += newAmount;
            }
        }

        transactionToEdit.amount = newAmount;
        transactionToEdit.type = newType;
        transactionToEdit.date = editTransactForm.form.get('transactDate')?.value;
        transactionToEdit.category = editTransactForm.form.get('transactCateg')?.value;

        this.loggedUserDashData.transactions[indx] = transactionToEdit;
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.closeTransactionPopup(editTransactForm, overlay, editTransactPopup);
        this.updateSignal = true;
    }

    delTransaction(indx: number) {
        this.updateDashBoardData();
        const transact = this.loggedUserDashData.transactions[indx];
        this.userDashData[this.loggedIndx].transactions.splice(indx, 1);
        if (transact.type == "income") this.userDashData[this.loggedIndx].income -= transact.amount;
        else this.userDashData[this.loggedIndx].expense -= transact.amount;
        this.userService.setUserDashData(this.userDashData);
        this.updateSignal = true;
        console.log("deleted!");
    }

    loadTransactionDtls(indx: number, editTransactForm: NgForm) {
        this.updateDashBoardData();
        const trasnsacrToEdit = this.loggedUserDashData.transactions[indx];
        editTransactForm.controls['transactTypeSel'].setValue(trasnsacrToEdit.type);
        editTransactForm.controls['transactAmt'].setValue(trasnsacrToEdit.amount);
        editTransactForm.controls['transactDate'].setValue(trasnsacrToEdit.date);
        editTransactForm.controls['transactCateg'].setValue(trasnsacrToEdit.category);
    }
}
