import { Injectable } from '@angular/core';
import { SignalRService, BroadcastMessage } from './signal-r.service';
import { AuthService } from './auth.service';
import { Observable, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { generateColor } from '../utils/color-generator';
import { ReminderService } from './reminder.service';
import { Reminder } from '../reminders-list/reminders-list.component';
import { FollowUpService } from './follow-up.service';
import { Offer } from '../inbox/inbox.component';

export type NotificationType = 'call' | 'message' | 'reminder' | 'broadcast' | 'follow-up' | 'offer';

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
  public unreadOffersCount$: Observable<number>;
  public totalOffersCount$: Observable<number>;
  public unreadFollowUpsCount$: Observable<number>;
  public totalFollowUpsCount$: Observable<number>;

  constructor(
    private signalRService: SignalRService,
    private authService: AuthService,
    private reminderService: ReminderService,
    private followUpService: FollowUpService
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

    const offerNotifications$ = this.followUpService.offers$.pipe(
      map(offers => this.mapOffersToNotifications(offers))
    );

    const allNotifications$ = this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        return combineLatest([broadcastNotifications$, reminderNotifications$, offerNotifications$]).pipe(
          map(([broadcasts, reminders, offers]) => {
            return [...broadcasts, ...reminders, ...offers].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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

    const offers$ = this.notifications$.pipe(map(n => n.filter(item => item.type === 'offer')), shareReplay(1));
    this.unreadOffersCount$ = offers$.pipe(map(items => items.filter(item => !item.isRead).length));
    this.totalOffersCount$ = offers$.pipe(map(items => items.length));

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

  public markOfferAsRead(guid: string): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.username && guid) {
      return this.followUpService.markOfferAsRead(currentUser.username, guid).pipe(
        switchMap(() => {
          this.authService.addReadOfferIdLocally(guid);
          return of(null);
        })
      );
    }
    return of(null);
  }

  private getDisplayText(offer: Offer): string {
    switch (offer.selectedType) {
      case 'Yes':
        return 'Property adviser has sent New Renewal Offers for 12 and 24 Months';
      case 'Only for 12 Months':
        return 'Property adviser has sent New Renewal Offers 12 Months';
      case 'Only for 24 Months':
        return 'Property adviser has sent New Renewal Offers 24 Months';
      case 'No':
        return 'Property adviser has acknowledged your decision to not renew';
      default:
        return offer.selectedType;
    }
  }

  private getOfferBody(offer: Offer): string {
    const downloadLink = '<a href="javascript:void(0);" class="download-link">Download Link</a>';
    let listItems = '';

    switch (offer.selectedType) {
      case 'Yes':
        listItems = `
          <li>Renewal @ 12 Months - Per $1500 Per Month with Tax benefits - ${downloadLink}</li>
          <li>Renewal @ 24 Months - Per $2800 Per Month with Tax benefits - ${downloadLink}</li>
        `;
        break;
      case 'Only for 12 Months':
        listItems = `<li>Renewal @ 12 Months - Per $1500 Per Month with Tax benefits - ${downloadLink}</li>`;
        break;
      case 'Only for 24 Months':
        listItems = `<li>Renewal @ 24 Months - Per $2800 Per Month with Tax benefits - ${downloadLink}</li>`;
        break;
      default:
        return 'No further details available.';
    }

    return `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
  }

  private mapOffersToNotifications(offers: Offer[]): Notification[] {
    const currentUser = this.authService.currentUserValue;
    const readOfferIds = new Set(currentUser?.readOfferIds || []);

    return offers.map(offer => {
      return {
        id: offer.guid,
        type: 'offer' as const,
        icon: 'bell',
        title: this.getDisplayText(offer),
        subtitle: `From: ${offer.sendUserFullName}`,
        content: this.getOfferBody(offer),
        date: new Date(offer.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: new Date(offer.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        from: offer.sendUserFullName,
        isRead: readOfferIds.has(offer.guid),
        timestamp: new Date(offer.dateTime)
      };
    });
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
