import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PopoverAction {
  text: string;
  style?: 'primary' | 'secondary' | 'destructive' | 'contact';
  action: () => void;
}

export interface BillingDetail {
  month: string;
  amount: string;
  status: string;
}

export interface BillingTab {
  title: string;
  details: BillingDetail[];
}

export interface PopoverData {
  title: string;
  content: string;
  from: string;
  date: string;
  time: string;
  actions?: PopoverAction[];
  showFollowUpIcon?: boolean;
  billingDetails?: BillingDetail[];
  billingTabs?: BillingTab[];
}

@Injectable({
  providedIn: 'root'
})
export class PopoverService {
  private popoverDataSubject = new BehaviorSubject<PopoverData | null>(null);

  getPopoverData(): Observable<PopoverData | null> {
    return this.popoverDataSubject.asObservable();
  }

    show(data: PopoverData): void {
    this.popoverDataSubject.next(data);
  }

  hide(): void {
    this.popoverDataSubject.next(null);
  }
}
