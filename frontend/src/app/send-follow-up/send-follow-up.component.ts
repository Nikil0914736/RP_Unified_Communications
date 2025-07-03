import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { generateColor } from '../utils/color-generator';

declare var feather: any;

@Component({
  selector: 'app-send-follow-up',
  templateUrl: './send-follow-up.component.html',
  styleUrls: ['./send-follow-up.component.css']
})
export class SendFollowUpComponent implements OnInit, AfterViewInit {
  searchText = '';
  results: any[] = [];
  error = '';
  searchPerformed = false;
  loading = false;

  constructor(private titleService: Title, private http: HttpClient) { }

  ngOnInit(): void {
    this.titleService.setTitle('Unified Communications - Send Follow-up');
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

  sendFollowUp(): void {
    this.searchPerformed = true;
    this.loading = true;
    this.error = '';
    this.results = [];

    const payload = { value: this.searchText };
    this.http.post<any>('http://localhost:5237/api/Renewal/GetExpiringRenewals', payload)
      .subscribe({
        next: (response) => {
          this.results = response.model || [];
          console.log('API Response:', response);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred.';
          console.error('API Error:', err);
          this.loading = false;
        }
      });
  }

  clear(): void {
    this.searchText = '';
    this.results = [];
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
}
