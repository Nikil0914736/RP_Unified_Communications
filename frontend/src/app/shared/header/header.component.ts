import { Component, Input, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TimeService } from '../../services/time.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string;
  userInitials: string;
  isProfileMenuVisible = false;
  isDarkMode: boolean;
  currentTime: string;
  private timeSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private timeService: TimeService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.userInitials = this.getInitials(user.fullName);
        } else if (user.username) {
          this.userInitials = user.username.charAt(0).toUpperCase();
        } else {
          this.userInitials = 'U'; // Default for User
        }
      } else {
        this.userInitials = ''; // Clear initials on logout
      }
      console.log('HeaderComponent: Final initials', this.userInitials);
    });

    this.timeSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });

    this.isDarkMode = localStorage.getItem('theme') !== 'light';
    this.updateBodyClass();
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  private getInitials(fullName: string): string {
    if (!fullName) {
      return 'U';
    }
    const names = fullName.split(' ').filter(Boolean);
    if (names.length === 0) {
      return 'U';
    }
    const firstInitial = names[0].charAt(0);
    const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuVisible = !this.isProfileMenuVisible;
  }

  private updateBodyClass(): void {
    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-mode');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
