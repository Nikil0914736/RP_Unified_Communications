import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: ToastMessage | null = null;
  private toastSubscription: Subscription;
  private timer: any;

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastSubscription = this.toastService.toastState.subscribe(
      (toast) => {
        this.toast = toast;
        if (toast) {
          if (this.timer) {
            clearTimeout(this.timer);
          }
          this.timer = setTimeout(() => {
            this.toastService.hide();
          }, 3000); // Auto-hide after 3 seconds
        }
      }
    );
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  getIcon() {
    if (!this.toast) return '';
    switch (this.toast.type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'info';
    }
  }
}
