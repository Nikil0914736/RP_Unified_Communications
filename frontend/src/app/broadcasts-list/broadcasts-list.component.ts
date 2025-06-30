import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { SignalRService } from '../services/signal-r.service';
import { PopoverService } from '../services/popover.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-broadcasts-list',
  templateUrl: './broadcasts-list.component.html',
  styleUrls: ['./broadcasts-list.component.css']
})
export class BroadcastsListComponent implements OnInit {
  broadcasts$: Observable<{ subject: string, content: string, from: string, date: string, time: string, initials: string }[]>;

  constructor(
    private titleService: Title,
    private signalRService: SignalRService,
    private popoverService: PopoverService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Broadcasts | Unified Communications');
    this.signalRService.startConnection();
    this.broadcasts$ = this.signalRService.messages$.pipe(
      map(messages => messages.map(message => {
        const timestamp = new Date(message.timestamp);
        const nameParts = message.fullName.split(' ').filter(n => n);
        const initials = nameParts.length > 1
          ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
          : nameParts[0].charAt(0);

        return {
          subject: message.subject,
          content: message.content,
          from: message.fullName,
          initials: initials.toUpperCase(),
          date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
      }))
    );
  }

        showPopover(broadcast: { subject: string, content: string, from: string, date: string, time: string }): void {
    this.popoverService.show({
      title: broadcast.subject,
      content: broadcast.content,
      from: broadcast.from,
      date: broadcast.date,
      time: broadcast.time
    });
  }
}
