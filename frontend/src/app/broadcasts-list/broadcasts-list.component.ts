import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { SignalRService } from '../services/signal-r.service';
import { AuthService } from '../services/auth.service';
import { PopoverService } from '../services/popover.service';
import { BroadcastMessage } from '../services/signal-r.service';
import { Observable } from 'rxjs';
import { generateColor } from '../utils/color-generator';

export interface DisplayBroadcast extends BroadcastMessage {
  initials: string;
  color: string;
  displayDate: string;
  displayTime: string;
}

@Component({
  selector: 'app-broadcasts-list',
  templateUrl: './broadcasts-list.component.html',
  styleUrls: ['./broadcasts-list.component.css']
})
export class BroadcastsListComponent implements OnInit {
  broadcasts$: Observable<DisplayBroadcast[]>;
  selectedBroadcastId: string | null = null;



  constructor(
    private titleService: Title,
    private signalRService: SignalRService,
    private popoverService: PopoverService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Broadcasts | Unified Communications');
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.signalRService.startConnection(currentUser.username);
    }
    this.broadcasts$ = this.signalRService.messages$.pipe(
      map(messages => messages.map(message => {
        const timestamp = new Date(message.timestamp);
        const nameParts = message.fullName.split(' ').filter(n => n);
        let initials = '';
        if (nameParts.length >= 3) {
          initials = nameParts.slice(0, 3).map(name => name.charAt(0)).join('');
        } else if (nameParts.length > 1) {
          initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
        } else if (nameParts.length === 1) {
          initials = nameParts[0].charAt(0);
        }

        return {
          ...message,
          initials: initials.toUpperCase(),
          color: generateColor(initials.toUpperCase()),
          displayDate: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          displayTime: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
      }))
    );
  }

  showPopover(broadcast: DisplayBroadcast): void {
    this.selectedBroadcastId = broadcast.id;
    setTimeout(() => { this.selectedBroadcastId = null; }, 300);
    if (!broadcast.isRead) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.username) {
        this.authService.markBroadcastAsRead(currentUser.username, broadcast.id).subscribe(() => {
          this.signalRService.markMessageAsRead(broadcast.id);
        });
      }
    }

    this.popoverService.show({
      title: broadcast.subject,
      content: broadcast.content,
      from: broadcast.fullName,
      date: broadcast.displayDate,
      time: broadcast.displayTime
    });
  }
}
