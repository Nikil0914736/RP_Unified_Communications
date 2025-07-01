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
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, AfterViewInit, OnDestroy {

  currentTime: string;
  private timeSubscription: Subscription;

  model: any = { role: 'resident' };
  loading = false;
  error = '';

  constructor(
    private titleService: Title,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private timeService: TimeService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Register | Unified Communications');

    this.timeSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
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
    this.authService.register(this.model)
      .subscribe(
        () => {
          this.alertService.success('Registration successful! Please log in.');
          this.router.navigate(['/login']);
        },
        error => {
          this.error = error;
          this.loading = false;
        });
  }
}
