import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { FollowUpService } from '../services/follow-up.service';
import { PopoverService } from '../services/popover.service';
import { generateColor } from '../utils/color-generator';

declare var feather: any;

interface Message {
  from: string;
  subject: string;
  time: string;
  isRead: boolean;
}

export interface Offer {
  guid: string;
  selectedType: string;
  sendUserEmail: string;
  sendUserFullName: string;
  dateTime: string;
  userEmail: string;
}

export interface DisplayOffer extends Offer {
  initials: string;
  color: string;
  displayDate: string;
  displayTime: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit, AfterViewInit {

  offers$: Observable<DisplayOffer[]>;
  error: string | null = null;

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private followUpService: FollowUpService,
    private popoverService: PopoverService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Inbox | Unified Communications');

    this.offers$ = combineLatest([
      this.followUpService.offers$,
      this.authService.currentUser
    ]).pipe(
      map(([offers, currentUser]) => {
        const readOfferIds = new Set(currentUser?.readOfferIds || []);
        return offers.map(offer => {
          return {
            ...this.toDisplayOffer(offer),
            isRead: readOfferIds.has(offer.guid)
          };
        });
      })
    );
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

  showOffer(offer: DisplayOffer): void {
    if (!offer.isRead) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        this.followUpService.markOfferAsRead(currentUser.username, offer.guid).subscribe({
          next: () => {
            this.authService.addReadOfferIdLocally(offer.guid);
          },
          error: (err) => console.error('Failed to mark offer as read:', err)
        });
      }
    }

    this.popoverService.show({
      title: 'New Offer',
      content: `You have received a new offer: ${offer.selectedType}`,
      from: offer.sendUserFullName,
      date: offer.displayDate,
      time: offer.displayTime
    });
  }

  private toDisplayOffer(offer: Offer): Omit<DisplayOffer, 'isRead'> {
    const timestamp = new Date(offer.dateTime);
    const nameParts = (offer.sendUserFullName || '').split(' ').filter(n => n);
    let initials = '';
    if (nameParts.length >= 3) {
      initials = nameParts.slice(0, 3).map(name => name.charAt(0)).join('');
    } else if (nameParts.length > 1) {
      initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
    } else if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0);
    }

    return {
      ...offer,
      initials: initials.toUpperCase(),
      color: generateColor(initials.toUpperCase()),
      displayDate: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      displayTime: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  }
}
