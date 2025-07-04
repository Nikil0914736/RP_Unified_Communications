import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ReminderService } from '../services/reminder.service';
import { PopoverService } from '../services/popover.service';
import { generateColor } from '../utils/color-generator';

export interface Reminder {
  id: string;
  email: string;
  content: string;
  sentBy: string;
  timestamp: string;
  isRead: boolean;
}

export interface DisplayReminder extends Reminder {
  initials: string;
  color: string;
  displayDate: string;
  displayTime: string;
}

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styles: [`
    /* General Layout */
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }

    /* Loading and Error Styles */
    .loading-indicator, .error-message {
        text-align: center;
        padding: 20px;
        font-size: 16px;
    }

    .error-message {
        color: red;
    }

    /* List Styles copied from Broadcasts List */
    .notification-list-redesigned {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .notification-item-redesigned {
        display: flex;
        align-items: center;
        padding: 15px 0 15px 15px;
        border-bottom: 1px solid #e5e5ea;
        cursor: pointer;
        position: relative;
    }

    .notification-item-redesigned.unread {
        background-color: #d9e8ff; /* A light blue */
    }

    .notification-item-redesigned.unread::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #007aff;
    }

    .notification-item-redesigned.unread .notification-details p {
        font-weight: 600;
    }

    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: #fff;
        flex-shrink: 0;
    }

    .notification-icon.reminder {
        font-size: 14px;
        font-weight: 600;
    }

    .notification-details {
        flex-grow: 1;
    }

    .notification-details p {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
    }

    .notification-details small {
        font-size: 12px;
        color: #8e8e93;
    }

    .notification-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 12px;
        color: #8e8e93;
        margin-left: auto;
        padding-left: 10px;
        flex-shrink: 0;
        margin-right: 10px;
    }

    /* Empty State Styles */
    .empty-state {
        text-align: center;
        padding: 50px 20px;
        color: #8e8e93;
    }

    .empty-state .empty-state-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 20px;
        color: #c7c7cc;
    }

    .empty-state h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 10px;
    }

    .empty-state p {
        font-size: 14px;
        margin: 0;
    }

    /* Dark Mode Styles */
    :host-context(.dark-mode) .notification-item-redesigned {
        border-bottom-color: #3a3a3c;
    }

    :host-context(.dark-mode) .notification-item-redesigned.unread {
        background-color: rgba(10, 132, 255, 0.2);
    }

    :host-context(.dark-mode) .notification-item-redesigned.unread::before {
        background-color: #0A84FF;
    }

    :host-context(.dark-mode) .notification-details p {
        color: #fff;
    }

    :host-context(.dark-mode) .notification-details small,
    :host-context(.dark-mode) .notification-time {
        color: #8e8e93;
    }

    :host-context(.dark-mode) .empty-state {
        color: #8e8e93;
    }

    :host-context(.dark-mode) .empty-state .empty-state-icon {
        color: #636366;
    }

    :host-context(.dark-mode) .empty-state h2 {
        color: #fff;
    }
  `]
})
export class RemindersListComponent implements OnInit {
  reminders$: Observable<DisplayReminder[]>;
  error: string | null = null;

  constructor(
    private titleService: Title,
    private reminderService: ReminderService,
    private authService: AuthService,
    private popoverService: PopoverService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Reminders | Unified Communications');
    this.reminders$ = this.authService.currentUser.pipe(
      switchMap(user => {
        if (user) {
          this.error = null;
          return this.reminderService.reminders$.pipe(
            map(reminders => reminders.map(r => this.toDisplayReminder(r)))
          );
        } else {
          this.error = 'You must be logged in to view reminders.';
          return of([]);
        }
      })
    );
  }

  showReminder(reminder: DisplayReminder): void {
    console.log(`showReminder called for reminder ID: ${reminder.id}, Current isRead: ${reminder.isRead}`);
    if (!reminder.isRead) {
      console.log('Reminder is unread. Calling markAsRead service...');
      this.reminderService.markAsRead(reminder.id).subscribe({
        next: () => {
          console.log('markAsRead service call successful. Updating UI locally.');
          this.reminderService.setReminderAsReadLocally(reminder.id);
        },
        error: (err) => {
          console.error('markAsRead service call failed:', err);
        }
      });
    }

    this.popoverService.show({
      title: 'Reminder',
      content: reminder.content,
      from: reminder.sentBy,
      date: reminder.displayDate,
      time: reminder.displayTime
    });
  }

  private toDisplayReminder(reminder: Reminder): DisplayReminder {
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
      ...reminder,
      initials: initials.toUpperCase(),
      color: generateColor(initials.toUpperCase()),
      displayDate: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      displayTime: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  }
}
