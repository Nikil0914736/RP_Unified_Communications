import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { TimeService } from '../services/time.service';
import { Subscription } from 'rxjs';

declare var feather: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy {

  currentTime: string;
  private timeSubscription: Subscription;

  model: any = {};
  loading = false;
  error = '';
  private errorTimeout: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private alertService: AlertService,
    private timeService: TimeService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Change Password | Unified Communications');

    this.timeSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.changePassword(this.model)
      .subscribe(
        () => {
          this.alertService.success('Password updated successfully! Please log in.');
          this.router.navigate(['/login']);
        },
        error => {
          this.error = error;
          this.loading = false;
          if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
          }
          this.errorTimeout = setTimeout(() => {
            this.error = '';
          }, 3000);
        });
  }
}
