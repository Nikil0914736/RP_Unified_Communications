import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5237/api/auth'; // Default Kestrel port
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    const currentUserString = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(currentUserString ? JSON.parse(currentUserString) : null);
    this.currentUser = this.currentUserSubject.asObservable();

    if (this.currentUserValue) {
      this.refreshUserProfile(this.currentUserValue.username).subscribe({
        error: err => {
          console.error('Failed to refresh user profile, logging out.', err);
          this.logout();
        }
      });
    }
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
      }),
      catchError(this.handleError)
    );
  }

  markBroadcastAsRead(username: string, broadcastId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-broadcast-as-read`, { username, broadcastId }).pipe(
      catchError(this.handleError)
    );
  }

  markReminderAsRead(username: string, reminderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-reminder-as-read`, { username, reminderId }).pipe(
      catchError(this.handleError)
    );
  }

  addReadOfferIdLocally(offerId: string): void {
    const currentUser = this.currentUserValue;
    if (currentUser && currentUser.readOfferIds && !currentUser.readOfferIds.includes(offerId)) {
      const updatedUser = {
        ...currentUser,
        readOfferIds: [...currentUser.readOfferIds, offerId]
      };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }

  refreshUserProfile(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${username}`).pipe(
      tap(userFromServer => {
        const currentUser = this.currentUserValue;
        // Preserve the token from the existing session
        const updatedUser = { ...userFromServer, token: currentUser.token };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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
