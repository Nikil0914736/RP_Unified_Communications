import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { FollowUpService } from '../services/follow-up.service';
import { PopoverService, PopoverAction, BillingDetail, BillingTab, PopoverData } from '../services/popover.service';
import { ToastService } from '../services/toast.service';
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
  displayText: string;
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
    private followUpService: FollowUpService,
    private authService: AuthService,
    private popoverService: PopoverService,
    private toastService: ToastService
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
          next: () => {},
          error: (err) => console.error('Failed to mark offer as read', err)
        });
      }
    }

    const actions: PopoverAction[] = [
      {
        text: 'Accepted the Offer',
        style: 'primary',
        action: () => {
          this.toastService.show('You have accepted the offer.', 'success');
          this.popoverService.hide();
        }
      },
      {
        text: 'Declined',
        style: 'destructive',
        action: () => {
          this.toastService.show('You have declined the offer.', 'error');
          this.popoverService.hide();
        }
      },
      {
        text: 'Provide More Offers',
        style: 'secondary',
        action: () => {
          this.toastService.show('Your request for more offers has been sent.', 'info');
          this.popoverService.hide();
        }
      },
      {
        text: 'Contact Leasing Contact',
        style: 'contact',
        action: () => {
          this.toastService.show('A leasing contact will be in touch with you shortly.', 'info');
          this.popoverService.hide();
        }
      }
    ];

    const popoverData: PopoverData = {
      title: offer.displayText,
      content: this.getDisplayBody(offer),
      from: offer.sendUserFullName,
      date: offer.displayDate,
      time: offer.displayTime,
      actions,
      showFollowUpIcon: true
    };

    if (offer.selectedType === 'Yes') {
      const tabs: BillingTab[] = [
        {
          title: '12 Months',
          details: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i).toLocaleString('default', { month: 'long', year: 'numeric' }),
            amount: '$1500.00',
            status: i < 3 ? 'Paid' : (i === 3 ? 'Pending' : 'Upcoming')
          }))
        },
        {
          title: '24 Months',
          details: Array.from({ length: 24 }, (_, i) => ({
            month: new Date(2024, i).toLocaleString('default', { month: 'long', year: 'numeric' }),
            amount: '$1350.00',
            status: i < 3 ? 'Paid' : (i === 3 ? 'Pending' : 'Upcoming')
          }))
        }
      ];
      popoverData.billingTabs = tabs;
    } else if (offer.selectedType === 'Only for 12 Months' || offer.selectedType === 'Only for 24 Months') {
      const months = offer.selectedType === 'Only for 12 Months' ? 12 : 24;
      popoverData.billingDetails = Array.from({ length: months }, (_, i) => ({
        month: new Date(2024, i).toLocaleString('default', { month: 'long', year: 'numeric' }),
        amount: months === 12 ? '$1500.00' : '$1400.00',
        status: i < 3 ? 'Paid' : (i === 3 ? 'Pending' : 'Upcoming')
      }));
    }

    this.popoverService.show(popoverData);
  }

  private toDisplayOffer(offer: Offer): Omit<DisplayOffer, 'isRead' | 'displayText'> & { displayText: string } {
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
      displayTime: timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      displayText: this.getDisplayText(offer)
    };
  }

  private getDisplayBody(offer: Offer): string {
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
}
