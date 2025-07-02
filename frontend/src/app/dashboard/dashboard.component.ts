import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { SignalRService } from '../services/signal-r.service';
import { NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

declare var feather: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  isResident = false;
  unreadAllNotificationCount$!: Observable<number>;
  totalAllNotificationCount$!: Observable<number>;
  unreadBroadcastCount$: Observable<number>;
  totalBroadcastCount$: Observable<number>;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private signalRService: SignalRService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard | Unified Communications');

    this.notificationService.start();
    this.unreadAllNotificationCount$ = this.notificationService.unreadAllNotificationCount$;
    this.totalAllNotificationCount$ = this.notificationService.totalAllNotificationCount$;

    this.unreadBroadcastCount$ = this.notificationService.unreadBroadcastCount$;
    this.totalBroadcastCount$ = this.notificationService.totalBroadcastCount$;

    this.authService.currentUser.subscribe(user => {
      this.isResident = user && user.role.toLowerCase() === 'resident';
      // Use setTimeout to ensure the view has updated from the *ngIf
      setTimeout(() => this.replaceIcons(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.replaceIcons();
  }

  private replaceIcons(): void {
    feather.replace({ width: '16px', height: '16px' });
  }
}
