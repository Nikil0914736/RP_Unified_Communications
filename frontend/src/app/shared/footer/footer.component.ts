import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ReminderService } from '../../services/reminder.service';
import { FollowUpService } from '../../services/follow-up.service';
import { Observable } from 'rxjs';

declare var feather: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewInit {
  isLeasingConsultant = false;
  isResident = false;
  unreadBroadcastCount$: Observable<number>;
  unreadRemindersCount$: Observable<number>;
  unreadOffersCount$: Observable<number>;
  unreadAllNotificationCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private reminderService: ReminderService,
    private followUpService: FollowUpService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLeasingConsultant = user && user.role.toLowerCase() === 'leasing consultant';
      this.isResident = user && user.role.toLowerCase() === 'resident';
    });

    this.unreadBroadcastCount$ = this.notificationService.unreadBroadcastCount$;
    this.unreadRemindersCount$ = this.reminderService.unreadCount$;
    this.unreadOffersCount$ = this.followUpService.unreadCount$;
    this.unreadAllNotificationCount$ = this.notificationService.unreadAllNotificationCount$;
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

}
