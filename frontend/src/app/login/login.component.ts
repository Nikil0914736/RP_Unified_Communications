import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TimeService } from '../services/time.service';
import { Subscription } from 'rxjs';

// Since feather-icons is loaded via a script tag, we declare it to avoid TypeScript errors.
declare var feather: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('loginForm') loginForm: NgForm;

  currentTime: string;
  private timeSubscription: Subscription;

  model: any = {
    username: '',
    password: ''
  };
  selectedModule = 'client';
  loading = false;
  error = '';

  constructor(
    private titleService: Title,
    private router: Router,
    private authService: AuthService,
    private timeService: TimeService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Login | Unified Communications');
    // logout on initialization
    this.authService.logout();

    this.timeSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  selectModule(module: string): void {
    if (this.selectedModule !== module) {
      this.selectedModule = module;
      this.error = '';
      // Reset the form's state and values to clear validation messages
      if (this.loginForm) {
        this.loginForm.resetForm();
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
        return;
    }

    this.loading = true;
    this.error = '';
    const loginPayload = { ...this.model, role: this.selectedModule };

    this.authService.login(loginPayload)
        .subscribe(
            () => {
                this.router.navigate(['/dashboard']);
            },
            error => {
                this.error = error;
                this.loading = false;
            });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    // This ensures the icons are rendered after the view is initialized.
    feather.replace();
  }
}
