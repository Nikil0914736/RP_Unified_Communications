import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { generateColor } from '../utils/color-generator';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { FollowUpService } from '../services/follow-up.service';


declare var feather: any;

interface RenewalResult {
  name: string;
  unit: string;
  leaseEndDate: number;
  leaseTerm: string;
  email?: string;
}

@Component({
  selector: 'app-send-follow-up',
  templateUrl: './send-follow-up.component.html',
  styleUrls: ['./send-follow-up.component.css']
})
export class SendFollowUpComponent implements OnInit, AfterViewInit {
  searchText = '';
  results: RenewalResult[] = [];
  error = '';
  searchPerformed = false;
  loading = false;

  openMenuFor: string | null = null;
  showConfirmationModal = false;
  confirmationTitle = '';
  confirmationButtons: string[] = [];
  selectedResident: RenewalResult | null = null;
  imageErrorTracker = new Set<string>();

    constructor(
    private titleService: Title,
    private http: HttpClient,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private authService: AuthService,
    private followUpService: FollowUpService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Unified Communications - Send Follow-up');
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openMenuFor && !this.elementRef.nativeElement.querySelector('.ellipsis-menu-container')?.contains(event.target)) {
      this.openMenuFor = null;
    }
  }



  sendFollowUp(): void {
    this.searchPerformed = true;
    this.loading = true;
    this.error = '';
    this.results = [];
    this.imageErrorTracker.clear();

    const payload = { value: this.searchText };
    this.http.post<{ model: RenewalResult[] }>('http://localhost:5237/api/Renewal/GetExpiringRenewals', payload)
      .subscribe({
        next: (response) => {
          this.results = (response.model || []).map(r => ({
            ...r,
            email: `${r.name.toLowerCase().replace(/\s+/g, '.')}@realpage.com`
          }));
          console.log('Manipulated Response:', this.results);
          this.loading = false;
          this.cdRef.detectChanges();
          feather.replace();
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred.';
          this.loading = false;
        }
      });
  }

  clear(): void {
    this.searchText = '';
    this.results = [];
    this.imageErrorTracker.clear();
    this.error = '';
    this.searchPerformed = false;
    this.loading = false;
  }

  getInitials(fullName: string): string {
    if (!fullName) {
      return 'U';
    }
    const names = fullName.split(' ').filter(Boolean);
    if (names.length === 0) {
      return 'U';
    }

    if (names.length >= 3) {
      return (names[0].charAt(0) + names[1].charAt(0) + names[2].charAt(0)).toUpperCase();
    }

    const firstInitial = names[0].charAt(0);
    const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  getUserColor(name: string): string {
    return generateColor(name);
  }

  onImageError(name: string): void {
    this.imageErrorTracker.add(name);
  }

  hasImageError(name: string): boolean {
    return this.imageErrorTracker.has(name);
  }

  getResidingSinceDate(result: RenewalResult): Date | null {
    if (!result.leaseEndDate || !result.leaseTerm) {
      return null;
    }

    const leaseTermString = result.leaseTerm;
    const parts = leaseTermString.split(' ');
    if (parts.length < 2) {
      return null;
    }

    const termValue = parseInt(parts[0], 10);
    if (isNaN(termValue)) {
      return null;
    }

    const termUnit = parts[1].toLowerCase();
    const endDate = new Date(result.leaseEndDate);

    if (termUnit.startsWith('month')) {
      const newDate = new Date(endDate);
      newDate.setMonth(newDate.getMonth() - termValue);
      return newDate;
    } else if (termUnit.startsWith('year')) {
      const newDate = new Date(endDate);
      newDate.setFullYear(newDate.getFullYear() - termValue);
      return newDate;
    } else {
      return null;
    }
  }

  calculateDaysUntilExpiry(endDate: number): number {
    if (!endDate) {
      return 0;
    }
    const today = new Date();
    const expiryDate = new Date(endDate);
    const differenceInTime = expiryDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays > 0 ? differenceInDays : 0;
  }

    sendNewOffer(result: RenewalResult): void {
    this.selectedResident = result;
    this.confirmationTitle = 'Do you want to send Offers for Lease Terms 12 & 24 Months?';
    this.confirmationButtons = ['Yes', 'Only for 12 Months'];
    this.showConfirmationModal = true;
  }

    handleConfirmation(selection: string | null): void {
    this.showConfirmationModal = false;
    if (!selection || !this.selectedResident) {
      return; // Modal was closed or no resident was selected
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
        this.alertService.error('You must be logged in to send an offer.');
        return;
    }

    const offerDetails = {
        selectedType: selection,
        sendUserEmail: currentUser.username,
        dateTime: new Date().toISOString(),
        userEmail: this.selectedResident.email
    };

    this.followUpService.sendNewOffer(offerDetails).subscribe({
        next: () => {
            this.alertService.success('New offer sent successfully!');
            this.openMenuFor = null; // Close the menu
        },
        error: (err) => {
            console.error('Error sending new offer:', err);
            this.alertService.error('Failed to send new offer. Please try again.');
            this.openMenuFor = null; // Close the menu
        }
    });
  }



      sendReminder(result: RenewalResult): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.alertService.error('You must be logged in to send a reminder.');
      return;
    }

    const daysUntilExpiry = this.calculateDaysUntilExpiry(result.leaseEndDate);
    const reminder = {
      email: result.email,
      content: `Sent Reminder with Remind Count Down of ${daysUntilExpiry} days`,
      sentBy: currentUser.fullName
    };

    this.http.post('http://localhost:5237/api/Reminder/Send', reminder)
      .subscribe({
        next: () => {
          this.alertService.success('Reminder sent successfully!');
        },
        error: (err) => {
          console.error('Error sending reminder:', err);
          this.alertService.error('Failed to send reminder. Please try again.');
        }
      });
  }

  toggleMenu(result: RenewalResult, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuFor = this.openMenuFor === result.name ? null : result.name;
  }

}
