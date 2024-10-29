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
            accno: newAccForm.controls['accNummber'].value,
            accifsc: newAccForm.controls['accIfsc'].value,
            accname: newAccForm.controls['accName'].value
        }
        const newTransact: Transaction = {
            type: "income",
            amount: newAccForm.controls['accBalance'].value,
            date: this.date2Day,
            category: "balance",
            source: newAccount.accno
        }
        this.loggedUserDashData.accounts.push();
        this.loggedUserDashData.transactions.push(newTransact);
        this.loggedUserDashData.income += newTransact.amount;
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.transactService.updateSignal = true;
        this.closeNewAccPopup(overlay, newAccPopup, newAccForm);
    }
}
