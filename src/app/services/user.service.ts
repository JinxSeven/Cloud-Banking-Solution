import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { UserDash } from '../interfaces/user-dash';

@Injectable({
    providedIn: 'root',
})

export class UserService {
    constructor() {}

    getUserLoginData(): User[] {
        const userData = localStorage.getItem("userLoginData");
        return userData ? JSON.parse(userData) : [];
    }

    setUserLoginData(updatedUserData: User[]) {
        localStorage.setItem("userLoginData", JSON.stringify(updatedUserData));
    }

    getUserDashData(): UserDash[] {
        const userDashData = localStorage.getItem("userDashData");
        return userDashData ? JSON.parse(userDashData) : [];
    }

    setUserDashData(updatedDashData: UserDash[]) {
        localStorage.setItem("userDashData", JSON.stringify(updatedDashData));
    }

    getLoggedIndx(): number {
        const indx = sessionStorage.getItem("loggedIndex");
        return indx ? JSON.parse(indx) : -1;
    }

    setLoggedIndx(indx: number) {
        sessionStorage.setItem("loggedIndex", JSON.stringify(indx));
    }

    authenticateUserCreds(userEmail: string, userPass: string): number {
        const userData = this.getUserLoginData();
        let indx: number = -404;
        for (let x = 0; x < userData.length; x++) {
            if (userData[x].email == userEmail) {
                indx = x;
                break;
            }
        }
        if (indx < 0) return indx;
        if (userData[indx].password == userPass) {
            return indx;
        }
        return -400;
    }
}
