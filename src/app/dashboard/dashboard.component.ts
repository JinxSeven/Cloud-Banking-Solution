import { Component, inject } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { UserDash } from '../interfaces/user-dash';
import { UserService } from '../services/user.service';
import { MainContentComponent } from './main-content/main-content.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        HeaderComponent,
        MainContentComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
    userDashData!: UserDash[];
    loggedIndx!: number;
    userService = inject(UserService);
    loggedUserDashData!: UserDash;

    constructor() {
        this.userDashData = this.userService.getUserDashData();
        this.loggedIndx = this.userService.getLoggedIndx();
        this.loggedUserDashData = this.userDashData[this.loggedIndx];
    }

    ngOnInit(): void {}
}
