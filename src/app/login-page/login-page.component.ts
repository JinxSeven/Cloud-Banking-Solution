import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
    errorOut: string = "‎";

    constructor (
        private userService: UserService,
        private route: Router
    ) {}

    onLogin(loginForm: NgForm) {
        const auth = this.userService.authenticateUserCreds(
            loginForm.controls["email"].value,
            loginForm.controls["password"].value
        )
        if (auth == -404) {
            this.errorOut = "Account not found!, Redirecting...";
            setTimeout(() => {
                this.route.navigate(["/register"]);
            }, 1500);
        } else if (auth == -400) {
            this.errorOut = "Invalid email or password!";
        } else {
            this.userService.setLoggedIndx(auth);
            alert("Login successful!");
            this.route.navigate(["/dashboard"]);
        }
    }
}
