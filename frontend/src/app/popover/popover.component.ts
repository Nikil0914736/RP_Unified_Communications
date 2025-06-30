import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopoverService, PopoverData } from '../services/popover.service';

declare var feather: any;

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css']
})
export class PopoverComponent implements OnInit, OnDestroy {
    popoverData: PopoverData | null = null;
  formattedContent: string | null = null;
  private subscription: Subscription;

  constructor(private popoverService: PopoverService) { }

  ngOnInit(): void {
    this.subscription = this.popoverService.getPopoverData().subscribe(data => {
      this.popoverData = data;
      if (data) {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        this.formattedContent = data.content
          .replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
          .replace(/\n/g, '<br>');

        // Use setTimeout to ensure icons are replaced after the view is updated
        setTimeout(() => feather.replace(), 0);
      } else {
        this.formattedContent = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  close(): void {
    this.popoverService.hide();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.popoverData) {
      this.close();
    }
  }
}
