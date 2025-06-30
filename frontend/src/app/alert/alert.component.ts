import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../services/alert.service';

declare var feather: any;

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  alert: Alert | null = null;
  private subscription: Subscription;

  constructor(private alertService: AlertService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.subscription = this.alertService.getAlert().subscribe(alert => {
      this.alert = alert;
      this.cdr.detectChanges(); // Manually trigger change detection
      if (alert) {
        setTimeout(() => this.closeAlert(), 5000); // Auto-close after 5 seconds
        setTimeout(() => feather.replace(), 0); // Render icons
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeAlert(): void {
    this.alertService.clear();
  }

  getIconName(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'info': return 'info';
    }
  }
}
