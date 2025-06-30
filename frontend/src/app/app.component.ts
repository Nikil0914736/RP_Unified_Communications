import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // Set the initial theme. Default to dark unless light is explicitly set.
    if (localStorage.getItem('theme') !== 'light') {
      this.renderer.addClass(this.document.body, 'dark-mode');
    }
  }
}
