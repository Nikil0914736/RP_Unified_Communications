import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Input() title = '';
  @Input() buttons: string[] = [];
  @Output() selection = new EventEmitter<string | null>();

  onSelect(choice: string | null): void {
    this.selection.emit(choice);
  }

  getButtonClass(buttonText: string): string {
    if (buttonText.toLowerCase().includes('yes')) {
      return 'modal-btn btn-primary';
    }
    if (buttonText.toLowerCase().includes('no')) {
      return 'modal-btn btn-tertiary';
    }
    return 'modal-btn btn-secondary';
  }
}
