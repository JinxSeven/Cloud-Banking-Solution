import { inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Goal, Transaction, UserDash } from '../interfaces/user-dash';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class GoalService {
    userService = inject(UserService);

    userDashData: UserDash[] = this.userService.getUserDashData();
    loggedIndx: number = this.userService.getLoggedIndx();
    loggedUserDashData: UserDash = this.userDashData[this.loggedIndx];

    updateDashBoardData() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    openGoalPopup(overlay: HTMLDivElement, goalPopup: HTMLDivElement) {
        overlay.style.display = "block";
        goalPopup.style.display = "block";
    }

    checkDuplicateGoals(newGoalForm: NgForm): boolean {
        for (let goal of this.loggedUserDashData.goals) {
            if (goal.name == newGoalForm.form.get("goalName")?.value) {
                return true;
            }
        }
        return false;
    }

    addNewGoal(
        newGoalForm: NgForm,
        overlay: HTMLDivElement,
        newGoalPopup: HTMLDivElement
    ) {
        this.updateDashBoardData();
        const newGoal: Goal = {
            name: newGoalForm.form.get("goalName")?.value,
            target: parseInt(newGoalForm.form.get("goalTrgt")?.value),
            contribution: parseInt(newGoalForm.form.get("initFund")?.value)
        }
        if (newGoal.contribution > 0) {
            const date2Day = new Date().toISOString().split('T')[0];
            const newTransaction: Transaction = {
                type: "expense",
                amount: newGoal.contribution,
                date: date2Day,
                category: "savings",
                source: 420
            }
            this.loggedUserDashData.transactions.push(newTransaction);
            this.loggedUserDashData.expense += newTransaction.amount;
        }
        this.loggedUserDashData.goals.push(newGoal);
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.closeGoalPopup(newGoalForm, overlay, newGoalPopup);
    }

    updateGoal(
        editGoalForm: NgForm,
        overlay: HTMLDivElement,
        editGoalPopup: HTMLDivElement,
        indx: number
    ): boolean {
        this.updateDashBoardData();
        const date2Day = new Date().toISOString().split('T')[0];
        let contribution = this.loggedUserDashData.goals[indx].contribution;
        if (editGoalForm.form.get('fundGoal')?.value > 0) {
            contribution += parseInt(editGoalForm.form.get('fundGoal')?.value);
            const newTransaction: Transaction = {
                type: "expense",
                amount: parseInt(editGoalForm.form.get('fundGoal')?.value),
                date: date2Day,
                category: "savings",
                source: 420
            }
            this.loggedUserDashData.transactions.push(newTransaction);
            this.loggedUserDashData.expense += newTransaction.amount;
        }
        const goalUpdate: Goal = {
            name: editGoalForm.form.get('modGoalName')?.value,
            contribution: contribution,
            target: editGoalForm.form.get('modGoalTrgt')?.value
        }
        this.loggedUserDashData.goals[indx] = goalUpdate;
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
        this.closeGoalPopup(editGoalForm, overlay, editGoalPopup);
        this.updateDashBoardData();
        if (
            this.loggedUserDashData.goals[indx].contribution ==
            this.loggedUserDashData.goals[indx].target
        ) {
            return true;
        }
        return false;
        }

    closeGoalPopup(
        goalForm: NgForm,
        overlay: HTMLDivElement,
        goalPopup: HTMLDivElement
    ) {
        goalPopup.style.display = "none";
        goalForm.reset();
        overlay.style.display = "none";
    }
}
