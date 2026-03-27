import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetConfig } from '../../models/customer.model';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close.emit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Configuration</h2>
            <button class="close-btn" (click)="close.emit()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="sheetId">Google Sheet ID</label>
              <input
                id="sheetId"
                type="text"
                [(ngModel)]="config.sheetId"
                placeholder="Enter your Google Sheet ID"
              />
            </div>
            <div class="form-group">
              <label for="apiKey">Google API Key</label>
              <input
                id="apiKey"
                type="password"
                [(ngModel)]="config.apiKey"
                placeholder="Enter your Google API Key"
              />
            </div>
            <div class="form-group">
              <label for="range">Sheet Range (optional)</label>
              <input
                id="range"
                type="text"
                [(ngModel)]="config.range"
                placeholder="Merged Contacts!A:G"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="close.emit()">Cancel</button>
            <button class="btn-primary" (click)="saveConfig()">Save</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .modal-body {
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .modal-footer {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      font-size: 14px;
    }
    .btn-primary {
      background: #1976d2;
      color: white;
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }
  `]
})
export class ConfigModalComponent {
  isOpen = input.required<boolean>();
  initialConfig = input<GoogleSheetConfig | null>(null);

  close = output<void>();
  save = output<GoogleSheetConfig>();

  config: GoogleSheetConfig = {
    sheetId: '',
    apiKey: '',
    range: 'Merged Contacts!A:G'
  };

  ngOnInit() {
    const initial = this.initialConfig();
    if (initial) {
      this.config = { ...initial };
    }
  }

  saveConfig() {
    if (this.config.sheetId && this.config.apiKey) {
      this.save.emit({ ...this.config });
    }
  }
}
