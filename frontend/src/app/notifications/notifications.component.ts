import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PopoverService } from '../services/popover.service';
import { AuthService } from '../services/auth.service';
import { Notification, NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  isResident = false;
  filter: 'all' | 'call' | 'reminder' | 'broadcast' = 'all';
  filteredNotifications$: Observable<Notification[]>;

  constructor(
    private titleService: Title,
    private notificationService: NotificationService,
    private popoverService: PopoverService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Notifications | Unified Communications');

    this.authService.currentUser.subscribe(user => {
      this.isResident = user && user.role.toLowerCase() === 'resident';
    });

    this.route.queryParams.subscribe(params => {
      const tab = params.tab;
      if (tab === 'alerts') {
        // For now, we can map 'alerts' to a specific filter or just default to all
        // Since there's no 'alert' type yet, we'll use 'call' as a placeholder
        this.setFilter('call');
      } else {
        this.setFilter('all');
      }
    });
  }

  setFilter(filter: 'all' | 'call' | 'reminder' | 'broadcast'): void {
    this.filter = filter;
    this.filteredNotifications$ = this.notificationService.notifications$.pipe(
      map(notifications => {
        if (filter === 'all') {
          return notifications;
        }
        return notifications.filter(n => n.type === filter);
      }),
    );
  }

  showPopover(notification: Notification): void {
    if (notification.type === 'broadcast' && !notification.isRead && notification.id) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.username) {
        this.authService.markBroadcastAsRead(currentUser.username, notification.id).subscribe(() => {
          this.notificationService.markBroadcastAsRead(notification.id);
        });
      }
    }

    if (notification.type === 'broadcast') {
        this.popoverService.show({
            title: notification.title,
            content: notification.content,
            from: notification.from,
            date: notification.date,
            time: notification.time
        });
    }
  }
}
