import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.role.toLowerCase() === 'client') {
            // Logged in and has client role, so return true
            return true;
        }

        // Not a client, so redirect to the dashboard
        this.router.navigate(['/dashboard']);
        return false;
    }
}
