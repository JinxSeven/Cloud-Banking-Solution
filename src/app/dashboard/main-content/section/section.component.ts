import { AccountService } from './../../../services/account.service';
import { Component, HostListener, inject } from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Account, Transaction, UserDash } from '../../../interfaces/user-dash';
import { GoalService } from '../../../services/goal.service';
import { TransactionService } from '../../../services/transaction.service';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-section',
    standalone: true,
    imports: [
        FormsModule
    ],
    templateUrl: './section.component.html',
    styleUrl: './section.component.css',
})
export class SectionComponent {
    userService = inject(UserService);
    goalService = inject(GoalService);
    transactService = inject(TransactionService);
    accountService = inject(AccountService);

    filterEnabled: boolean = false;
    filterToDate: string | null = null;
    filterFromDate: string | null = null;

    userDashData: UserDash[] = this.userService.getUserDashData();
    loggedIndx: number = this.userService.getLoggedIndx();
    loggedUserDashData: UserDash = this.userDashData[this.loggedIndx];

    errorOut: string = "‎";
    arrOfOptions: string[] = this.transactService.returnAptCategories("expense");
    arrOfAccounts: Account[] = this.accountService.updateAccountsArr();
    expenseChart: Chart | null = null;
    idx: number | null = null;
    transactionsToShow: Transaction[] = this.loggedUserDashData.transactions;
    csvString!: any;

    constructor() { }

    updateDashBoardData() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    dateValidator(control: AbstractControl) {
        const fromDate = new Date(control.get('startDate')?.value);
        const toDate = new Date(control.get('endDate')?.value);

        if (fromDate && toDate && fromDate > toDate) {
            return { invalidDateRange: true };
        }
        return null;
    }

    ngDoCheck() {
        this.updateDashBoardData();
        this.transactService.updateDashBoardData();
        this.goalService.updateDashBoardData();
        this.accountService.updateDashBoardData();
        if (this.transactService.updateSignal) {
            this.updateChart();
            this.updateDashBoardData();
            this.arrOfAccounts = this.accountService.updateAccountsArr();
            this.transactService.updateSignal = false;
            this.transactionsToShow = this.loggedUserDashData.transactions;
        }
        if (this.filterEnabled) {
            this.updateChart();
            this.filterEnabled = false;
            this.filterToDate = null;
            this.filterFromDate = null;
        }
        this.csvString = [
            [
                "Type",
                "Amount",
                "Source/Destination",
                "Category",
                "Date"
            ],
            ...this.transactionsToShow.map(transaction => [
                transaction.type,
                transaction.amount,
                transaction.toOrFrom,
                transaction.category,
                transaction.date
            ])
        ];
    }

    addNewGoal(
        newGoalForm: NgForm,
        overlay: HTMLDivElement,
        newGoalPopup: HTMLDivElement
    ) {
        this.goalService.addNewGoal(newGoalForm, overlay, newGoalPopup);
    }

    openNewGoalPopup(overlay: HTMLDivElement, newGoalPopup: HTMLDivElement) {
        this.goalService.openGoalPopup(overlay, newGoalPopup);
    }

    checkDuplicateGoals(newGoalForm: NgForm): boolean {
        const bool = this.goalService.checkDuplicateGoals(newGoalForm);
        return bool;
    }

    closeNewGoalPopup(
        newGoalForm: NgForm,
        overlay: HTMLDivElement,
        newGoalPopup: HTMLDivElement
    ) {
        this.goalService.closeGoalPopup(newGoalForm, overlay, newGoalPopup);
    }

    openTransactPopup(
        overlay: HTMLDivElement,
        newTransactPopup: HTMLDivElement,
        indx: number | null,
        editTransactForm: NgForm
    ) {
        this.idx = indx;
        this.transactService.openTransactPopup(overlay, newTransactPopup);
        if (indx != null) {
            this.arrOfOptions = this.transactService.returnAptCategories(
                this.loggedUserDashData.transactions[indx].type
            );
            this.transactService.loadTransactionDtls(indx, editTransactForm);
        }
    }

    loadAptCategories(transactForm: NgForm) {
        if (transactForm.form.get('transactTypeSel')?.value == "income") {
            this.arrOfOptions = this.transactService.returnAptCategories("income");
        } else {
            this.arrOfOptions = this.transactService.returnAptCategories("expense");
        }
    }

    addNewTransaction(
        newTransactForm: NgForm,
        overlay: HTMLDivElement,
        newTransactPopup: HTMLDivElement
    ) {
        this.transactService.addNewTransaction(newTransactForm, overlay, newTransactPopup);
        console.log("newTransactAdded");
    }

    closeTransactionPopup(
        newTransactForm: NgForm,
        overlay: HTMLDivElement,
        newTransactPopup: HTMLDivElement
    ) {
        this.transactService.closeTransactionPopup(newTransactForm, overlay, newTransactPopup);
    }

    updateTransaction(
        editTransactForm: NgForm,
        overlay: HTMLDivElement,
        editTransactPopup: HTMLDivElement
    ) {
        this.transactService.updateTransaction(editTransactForm, overlay, editTransactPopup, this.idx!);
    }

    delTransaction(indx: number): void {
        this.transactService.delTransaction(indx);
    }

    openNewAccPopup(overlay: HTMLDivElement, newAccPopup: HTMLDivElement){
        this.accountService.openNewAccPopup(overlay, newAccPopup);
    }

    addNewAccount(newAccForm: NgForm, overlay: HTMLDivElement, newAccPopup: HTMLDivElement) {
        this.accountService.addNewAccount(newAccForm, overlay, newAccPopup);
    }

    closeNewAccPopup(
        newAccForm: NgForm,
        overlay: HTMLDivElement,
        newAccPopup: HTMLDivElement
    ) {
        this.accountService.closeNewAccPopup(
            overlay,
            newAccPopup,
            newAccForm
        )
    }

    ngAfterViewInit() {
        const chartElement = document.getElementById('expense-chart') as HTMLCanvasElement;
        if (!chartElement) return;
        else this.initializeChart(chartElement);
    }

    initializeChart(chartElement: HTMLCanvasElement) {
        this.expenseChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: [
                "Entertainment",
                "Health",
                "Shopping",
                "Travel",
                "Education",
                "Other"
                ],
                datasets: [{
                label: 'Expense',
                data: this.updateExpenseChartData(),
                backgroundColor: "#af92ff"
            }]
            },
            options: {
                scales: {
                    y: {
                    beginAtZero: true
                    }
                },
                responsive: true,
            }
        });
        if (window.innerWidth < 1404 && window.innerWidth > 1079) this.updateChartData();
        if (window.innerWidth < 608) this.updateChartData();
    }

    updateExpenseChartData(): number[] {
        const transactions = this.loggedUserDashData.transactions || [];
        let expenses = transactions.filter((itr: any) => itr.type === "expense");
        let filteredExpenses: Transaction[] = [];

        if (this.filterEnabled) {
            filteredExpenses = expenses.filter((itr: Transaction) => {
                const itrDate = new Date(itr.date);
                const fromDate = new Date(this.filterFromDate!);
                const toDate = new Date(this.filterToDate!);
                return itrDate >= fromDate && itrDate <= toDate;
            });
        }
        const categories = ["Entertainment", "Health", "Shopping", "Travel", "Education", "Other"];
        const categoryMap = new Map(categories.map(categ => [categ, 0]));

        if (this.filterEnabled && filteredExpenses.length < 1) {
            return [];
        }
        if (filteredExpenses.length > 0) {
            expenses = filteredExpenses;
        }

        expenses.forEach(expense => {
            const category = this.getCategoryFromPurpose(expense.category);
            if (category) {
                categoryMap.set(category, (categoryMap.get(category) || 0) + expense.amount);
            }
        });

        return Array.from(categoryMap.values());
    }

    getCategoryFromPurpose(purpose: string): string | null {
        const categories = [
            { purpose: 'entertainment', category: 'Entertainment' },
            { purpose: 'health', category: 'Health' },
            { purpose: 'shopping', category: 'Shopping' },
            { purpose: 'travel', category: 'Travel' },
            { purpose: 'education', category: 'Education' },
            { purpose: 'other', category: 'Other' }
        ];

        const matchingCategory = categories.find(categ => categ.purpose.toLowerCase() === purpose.toLowerCase());
        return matchingCategory ? matchingCategory.category : null;
    }

    updateChart() {
        if (this.expenseChart) {
            this.expenseChart.data.datasets.forEach((dataset: any) => {
                dataset.data = this.updateExpenseChartData();
            });
            this.expenseChart.update();
        }
    }

    loadAptTransactions(accNum: string): Transaction[] {
        this.updateDashBoardData();
        if (accNum == "") {
            this.transactionsToShow = this.loggedUserDashData.transactions
            return this.transactionsToShow;
        }
        this.transactionsToShow = [];
        const userTransactions = this.loggedUserDashData.transactions;
        userTransactions.forEach(transact => {
            if (transact.toOrFrom == Number(accNum)) {
                this.transactionsToShow.push(transact);
            }
        });
        return this.transactionsToShow;
    }

    openFilterPopup(overlay: HTMLDivElement, expFltrPopup: HTMLDivElement) {
        overlay.style.display = "block";
        expFltrPopup.style.display = "block";
    }

    closeFilterPopup(overlay: HTMLDivElement, expFltrPopup: HTMLDivElement, expFltrForm: NgForm) {
        overlay.style.display = "none";
        expFltrPopup.style.display = "none";
        expFltrForm.reset();
    }

    applyExpenseChartFilter(expFltrForm: NgForm, overlay: HTMLDivElement, expFltrPopup: HTMLDivElement) {
        this.filterFromDate = expFltrForm.form.get('fromDate')?.value;
        this.filterToDate = expFltrForm.form.get('toDate')?.value;
        this.filterEnabled = true;
        this.closeFilterPopup(overlay, expFltrPopup, expFltrForm);
    }

    downloadTransactionsCsv(transactFilterForm: NgForm) {
        let fileName: string;
        const account: Account[] = this.arrOfAccounts.filter(acc => {
            return acc.accno == transactFilterForm.form.get('accSel')?.value;
        });
        if (account.length > 0) {
            fileName = account[0].accname
        } else {
            fileName = "Transactions";
        }
        const csvContent = this.csvString
            .map((row: any) => row
            .map((cell: any) => `"${cell}"`)
            .join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    }

    updateChartData() {
        const chartDataXSmall = ["Ent..", "Hea..", "Shp..", "Tra..", "Edu..", "Oth.."];
        this.expenseChart!.data.labels = chartDataXSmall;
        this.expenseChart!.update();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        window.location.reload();
        if (window.innerWidth < 1404 && window.innerWidth > 1079) this.updateChartData();
        if (window.innerWidth < 608) this.updateChartData();
    }


    filterChartReset() {
        const exp = this.updateExpenseChartData();
        const expname = ["Entertainment", "Health", "Shopping", "Travel", "Education", "Other"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = exp;
        this.expenseChart!.update();
        this.updateChart()
        if (window.innerWidth < 1404 && window.innerWidth > 1079) this.updateChartData();
        if (window.innerWidth < 608) this.updateChartData();
    }

    filterChartEntertain() {
        const exp = this.updateExpenseChartData();
        const expname = ["Entertainment"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[0]];
        this.expenseChart!.update();
    }

    filterChartHealth() {
        const exp = this.updateExpenseChartData();
        const expname = ["Health"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[1]];
        this.expenseChart!.update();
    }

    filterChartShopping() {
        const exp = this.updateExpenseChartData();
        const expname = ["Shopping"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[2]];
        this.expenseChart!.update();
    }

    filterChartTravel() {
        const exp = this.updateExpenseChartData();
        const expname = ["Travel"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[3]];
        this.expenseChart!.update();
    }

    filterChartEducation() {
        const exp = this.updateExpenseChartData();
        const expname = ["Education"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[4]];
        this.expenseChart!.update();
    }

    filterChartOther() {
        const exp = this.updateExpenseChartData();
        const expname = ["Other"];
        this.expenseChart!.data.labels = expname;
        this.expenseChart!.config.data.datasets[0].data = [exp[5]];
        this.expenseChart!.update();
    }
}
