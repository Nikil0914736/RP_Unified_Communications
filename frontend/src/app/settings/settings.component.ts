import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

declare var feather: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit {

  private themeToggle: HTMLInputElement | null = null;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title
  ) { }



  ngOnInit(): void {
    this.titleService.setTitle('Settings | Unified Communications');
  }

  ngAfterViewInit(): void {
    feather.replace();

    this.themeToggle = this.document.getElementById('theme-toggle') as HTMLInputElement;

    // Set the toggle's initial state
    if (this.themeToggle) {
      this.themeToggle.checked = this.document.body.classList.contains('dark-mode');
      // Listen for changes on the toggle
      this.renderer.listen(this.themeToggle, 'change', () => {
        if (this.themeToggle?.checked) {
          this.renderer.addClass(this.document.body, 'dark-mode');
          localStorage.removeItem('theme'); // Default is dark, so remove the 'light' setting
        } else {
          this.renderer.removeClass(this.document.body, 'dark-mode');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }
}
