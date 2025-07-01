import { Injectable, Injector } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5237/api/auth'; // Default Kestrel port
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private injector: Injector) {
    const currentUserString = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(currentUserString ? JSON.parse(currentUserString) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  register(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, model).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, model).pipe(
      catchError(this.handleError)
    );
  }

  login(username: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password, role }).pipe(
      tap(user => {
        console.log('AuthService: User logged in', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        const notificationService = this.injector.get(NotificationService);
        notificationService.start();
      }),
      catchError(this.handleError)
    );
  }

  markBroadcastAsRead(username: string, broadcastId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-broadcast-as-read`, { username, broadcastId }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    const notificationService = this.injector.get(NotificationService);
    notificationService.stop();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors. The backend should return a JSON object with a 'message' property.
      errorMessage = error.error?.message || `Server Error: ${error.status}. Please check the backend console for more details.`;
    }
    return throwError(errorMessage);
  }
}
