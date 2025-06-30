import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PopoverData {
  title: string;
  content: string;
  from: string;
  date: string;
  time: string;
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
