import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Alert {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert | null>();

  getAlert(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  success(message: string): void {
    this.alertSubject.next({ message, type: 'success' });
  }

  error(message: string): void {
    this.alertSubject.next({ message, type: 'error' });
  }

  info(message: string): void {
    this.alertSubject.next({ message, type: 'info' });
  }

  clear(): void {
    this.alertSubject.next(null);
  }
}
