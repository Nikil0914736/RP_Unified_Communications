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
  isClient = false;
  broadcastCount$: Observable<number>;
  notificationCount$: Observable<number>;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private signalRService: SignalRService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard | Unified Communications');
    this.signalRService.startConnection();

    this.broadcastCount$ = this.signalRService.messages$.pipe(
      map(messages => messages.length)
    );

    this.notificationCount$ = this.notificationService.notificationCount$;

    this.authService.currentUser.subscribe(user => {
      this.isClient = user && user.role.toLowerCase() === 'client';
    });
  }

  ngAfterViewInit(): void {
    feather.replace({ width: '24px', height: '24px' });
  }
}
