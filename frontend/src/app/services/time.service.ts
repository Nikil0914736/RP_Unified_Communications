import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private clock$: Observable<string>;

  constructor() {
    this.clock$ = timer(0, 1000).pipe(
      map(() => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }),
      shareReplay(1)
    );
  }

  public getCurrentTime(): Observable<string> {
    return this.clock$;
  }
}
