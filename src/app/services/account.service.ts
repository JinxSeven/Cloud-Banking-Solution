import { style } from '@angular/animations';
import { inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Account, Transaction, UserDash } from '../interfaces/user-dash';
import { UserService } from './user.service';
import { TransactionService } from './transaction.service';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    constructor() {}
    date2Day = new Date().toISOString().split('T')[0];

    userService = inject(UserService);
    transactService = inject(TransactionService);

    userDashData: UserDash[] = this.userService.getUserDashData();
    loggedIndx: number = this.userService.getLoggedIndx();
    loggedUserDashData: UserDash = this.userDashData[this.loggedIndx];
    arrOfAccounts: Account[] = this.updateAccountsArr();

    updateDashBoardData() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    updateAccountsArr(): Account[] {
        this.arrOfAccounts = [];
        this.updateDashBoardData();
        const userAccounts = this.loggedUserDashData.accounts;
        userAccounts.forEach(acc => {
            this.arrOfAccounts.push(acc);
        });
        return this.arrOfAccounts;
    }

    openNewAccPopup(overlay: HTMLDivElement, newAccPopup: HTMLDivElement) {
        overlay.style.display = "block";
        newAccPopup.style.display = "block";
    }

    closeNewAccPopup(
        overlay: HTMLDivElement,
        newAccPopup: HTMLDivElement,
        newAccForm: NgForm
    ) {
        newAccPopup.style.display = "none";
        newAccForm.reset();
        overlay.style.display = "none";
    }

    addNewAccount(newAccForm: NgForm, overlay: HTMLDivElement, newAccPopup: HTMLDivElement) {
        const newAccount: Account = {
            accno: newAccForm.form.get('accNumber')?.value,
            accifsc: newAccForm.form.get('accIfsc')?.value,
            accname: newAccForm.form.get('accName')?.value
        }
        const newTransact: Transaction = {
            type: "income",
            amount: newAccForm.form.get('accBalance')?.value,
            date: this.date2Day,
            category: "Initial",
            toOrFrom: newAccount.accno
        }
        this.loggedUserDashData.accounts.push(newAccount);
        this.loggedUserDashData.transactions.push(newTransact);
        this.loggedUserDashData.income += Number(newTransact.amount);
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.transactService.updateSignal = true;
        this.closeNewAccPopup(overlay, newAccPopup, newAccForm);
    }
}
