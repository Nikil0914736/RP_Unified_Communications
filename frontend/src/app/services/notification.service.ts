import { Injectable } from '@angular/core';
import { SignalRService, BroadcastMessage } from './signal-r.service';
import { AuthService } from './auth.service';
import { Observable, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { generateColor } from '../utils/color-generator';
import { ReminderService } from './reminder.service';
import { Reminder } from '../reminders-list/reminders-list.component';

export type NotificationType = 'call' | 'message' | 'reminder' | 'broadcast' | 'follow-up';

export interface Notification {
  id?: string; // Optional because not all notifications have an ID
  type: NotificationType;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  date?: string;
  content?: string;
  from?: string;
  initials?: string;
  color?: string;
  isRead?: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications$: Observable<Notification[]>;
  public unreadBroadcastCount$: Observable<number>;
  public totalBroadcastCount$: Observable<number>;
  public unreadAllNotificationCount$: Observable<number>;
  public totalAllNotificationCount$: Observable<number>;

  public unreadAlertsCount$: Observable<number>;
  public totalAlertsCount$: Observable<number>;
  public unreadRemindersCount$: Observable<number>;
  public totalRemindersCount$: Observable<number>;
  public unreadFollowUpsCount$: Observable<number>;
  public totalFollowUpsCount$: Observable<number>;

  constructor(
    private signalRService: SignalRService,
    private authService: AuthService,
    private reminderService: ReminderService
  ) {
    this.authService.currentUser.pipe(
      distinctUntilChanged((prev, curr) => prev?.username === curr?.username)
    ).subscribe(user => {
      if (user) {
        this.signalRService.startConnection(user.username);
      } else {
        this.signalRService.stopConnection();
      }
    });

    const broadcastNotifications$ = this.signalRService.messages$.pipe(
      map(messages => this.mapBroadcastsToNotifications(messages))
    );

    const reminderNotifications$ = this.reminderService.reminders$.pipe(
      map(reminders => this.mapRemindersToNotifications(reminders))
    );

    const allNotifications$ = this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        return combineLatest([broadcastNotifications$, reminderNotifications$]).pipe(
          map(([broadcasts, reminders]) => {
            return [...broadcasts, ...reminders].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          })
        );
      }),
      shareReplay(1)
    );

    this.notifications$ = combineLatest([
      this.authService.currentUser,
      allNotifications$
    ]).pipe(
      map(([user, notifications]) => {
        if (!user) { return []; }
        const isResident = user.role.toLowerCase() === 'resident';
        if (isResident) {
          return notifications;
        }
        return notifications.filter(n => n.type !== 'broadcast');
      }),
      shareReplay(1)
    );

    const broadcasts$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.type === 'broadcast')),
      shareReplay(1)
    );

    this.unreadBroadcastCount$ = broadcasts$.pipe(
      map(broadcasts => broadcasts.filter(b => !b.isRead).length)
    );

    this.totalBroadcastCount$ = broadcasts$.pipe(
      map(broadcasts => broadcasts.length)
    );

    const alerts$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'call')), shareReplay(1));
    this.unreadAlertsCount$ = alerts$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalAlertsCount$ = alerts$.pipe(map(items => items.length));

    const reminders$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'reminder')), shareReplay(1));
    this.unreadRemindersCount$ = reminders$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalRemindersCount$ = reminders$.pipe(map(items => items.length));

    const followUps$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'follow-up')), shareReplay(1));
    this.unreadFollowUpsCount$ = followUps$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalFollowUpsCount$ = followUps$.pipe(map(items => items.length));

    this.unreadAllNotificationCount$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead).length),
      shareReplay(1)
    );

    this.totalAllNotificationCount$ = this.notifications$.pipe(
      map(notifications => notifications.length),
      shareReplay(1)
    );
  }

  public markBroadcastAsRead(id: string): void {
    this.signalRService.markMessageAsRead(id);
  }

  public markReminderAsRead(id: string): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.username && id) {
      this.authService.markReminderAsRead(currentUser.username, id).subscribe(() => {
        this.reminderService.setReminderAsReadLocally(id);
      });
    }
  }

  private mapBroadcastsToNotifications(messages: BroadcastMessage[]): Notification[] {
    return messages.map(msg => {
      const nameParts = msg.fullName.split(' ').filter(n => n);
      let initials = '';
      if (nameParts.length >= 3) {
        initials = nameParts.slice(0, 3).map(name => name.charAt(0)).join('');
      } else if (nameParts.length > 1) {
        initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
      } else if (nameParts.length === 1) {
        initials = nameParts[0].charAt(0);
      }
      const timestamp = new Date(msg.timestamp);

      return {
        id: msg.id,
        type: 'broadcast' as const,
        icon: 'radio',
        title: msg.subject,
        subtitle: `From: ${msg.fullName}`,
        date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        content: msg.content,
        from: msg.fullName,
        initials: initials.toUpperCase(),
        color: generateColor(initials.toUpperCase()),
        isRead: msg.isRead,
        timestamp
      };
    });
  }

  private mapRemindersToNotifications(reminders: Reminder[]): Notification[] {
    return reminders.map(reminder => {
      const timestamp = new Date(reminder.timestamp);
      const nameParts = reminder.sentBy.split(' ').filter(n => n);
      let initials = '';
      if (nameParts.length >= 3) {
        initials = nameParts.slice(0, 3).map(name => name.charAt(0)).join('');
      } else if (nameParts.length > 1) {
        initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
      } else if (nameParts.length === 1) {
        initials = nameParts[0].charAt(0);
      }

      return {
        id: reminder.id,
        type: 'reminder' as const,
        icon: 'calendar',
        title: 'Reminder',
        subtitle: `From: ${reminder.sentBy}`,
        content: reminder.content,
        date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        from: reminder.sentBy,
        initials: initials.toUpperCase(),
        color: generateColor(initials.toUpperCase()),
        isRead: reminder.isRead,
        timestamp
      };
    });
  }
}
