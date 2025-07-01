import { Component, Input, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-feather-icon',
  template: '<ng-content></ng-content>',
  styles: [':host { display: inline-block; }']
})
export class FeatherIconComponent implements OnChanges {
  @Input() icon: string;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.icon) {
      const iconName = changes.icon.currentValue;
      if (feather.icons[iconName]) {
        this.el.nativeElement.innerHTML = feather.icons[iconName].toSvg();
      } else {
        this.el.nativeElement.innerHTML = ''; // Clear if icon not found
      }
    }
  }
}
