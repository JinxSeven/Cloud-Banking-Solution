import { Component, inject } from '@angular/core';
import { UserDash } from '../../../interfaces/user-dash';
import { GoalService } from '../../../services/goal.service';
import { UserService } from '../../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Block } from '@angular/compiler';
import { TransactionService } from '../../../services/transaction.service';

@Component({
    selector: 'app-aside',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './aside.component.html',
    styleUrl: './aside.component.css',
})
export class AsideComponent {
    errorOut: string = "‎";
    idx: number | null = null;

    userService = inject(UserService);
    goalService = inject(GoalService);
    transactService = inject(TransactionService);

    userDashData: UserDash[] = this.userService.getUserDashData();
    loggedIndx: number = this.userService.getLoggedIndx();
    loggedUserDashData: UserDash = this.userDashData[this.loggedIndx];

    updateDashBoardData() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    ngDoCheck() {
        this.updateDashBoardData();
        this.transactService.updateDashBoardData();
        this.goalService.updateDashBoardData();
    }

    editPopupGoalIndx!: number;
    editPopupGoalName!: string;
    editPopupGoalTrgt!: number;
    editPopupGoalFund!: number;
    editPopupGoalBlnc!: number;

    openEditGoal(
        indx: number,
        overlay: HTMLDivElement,
        editGoalPopup: HTMLDivElement,
        editGoalForm: NgForm
    ) {
        this.idx = indx;
        const goalToFund = this.loggedUserDashData.goals[indx];
        this.editPopupGoalIndx = indx;
        this.editPopupGoalName = goalToFund.name;
        this.editPopupGoalTrgt = goalToFund.target;
        editGoalForm.controls['modGoalName'].setValue(goalToFund.name);
        editGoalForm.controls['modGoalTrgt'].setValue(goalToFund.target);
        if (!goalToFund.contribution) this.editPopupGoalFund = 0;
        else this.editPopupGoalFund = goalToFund.contribution;
        this.editPopupGoalBlnc = this.editPopupGoalTrgt - this.editPopupGoalFund;
        this.goalService.openGoalPopup(overlay, editGoalPopup);
    }

    updateGoal(
        editGoalForm: NgForm,
        overlay: HTMLDivElement,
        editGoalPopup: HTMLDivElement,
        goalCompPopup: HTMLDivElement
    ) {
        if (this.goalService.updateGoal(editGoalForm, overlay, editGoalPopup, this.editPopupGoalIndx)) {
            overlay.style.display = "block";
            goalCompPopup.style.display = "block";
        }
    }

    deleteGoal(indx: number) {
        const amountToAdd = this.loggedUserDashData.goals[indx].contribution;
        this.loggedUserDashData.expense -= amountToAdd;
        this.loggedUserDashData.goals.splice(indx, 1);
        this.userDashData[this.loggedIndx] = this.loggedUserDashData;
        this.userService.setUserDashData(this.userDashData);
    }

    closeGoalPopup(
        goalForm: NgForm,
        overlay: HTMLDivElement,
        goalPopup: HTMLDivElement
    ) {
        this.goalService.closeGoalPopup(goalForm, overlay, goalPopup);
    }

    checkDuplicateGoals(editGoalForm: NgForm, idx: number): boolean {
        for (let x = 0; x < this.loggedUserDashData.goals.length; x++) {
            if (x == idx) continue;
            if (this.loggedUserDashData.goals[x].name == editGoalForm.form.get("modGoalName")?.value) {
                return true;
            }
        }
        return false;
    }
}
