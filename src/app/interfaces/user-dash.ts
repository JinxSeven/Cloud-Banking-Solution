export interface UserDash {
    email: string;
    username: string;
    income: number;
    expense: number;
    transactions: Transaction[];
    goals: Goal[];
    accounts: Account[];
}

export interface Transaction {
    type: string;
    amount: number;
    date: string;
    category: string;
    toOrFrom: number;
}

export interface Goal {
    name: string;
    target: number;
    contribution: number;
}

export interface Account {
    accname: string;
    accno: number;
    accifsc: string;
}
