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
            <div class="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div class="header-text">
              <h2>Configuration</h2>
              <p>Connect your Google Sheet</p>
            </div>
            <button class="close-btn" (click)="close.emit()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="sheetId">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Google Sheet ID
              </label>
              <input
                id="sheetId"
                type="text"
                [(ngModel)]="config.sheetId"
                placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
              <span class="hint">Find this in your Google Sheet URL</span>
            </div>
            <div class="form-group">
              <label for="apiKey">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 0 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L15 5.96"></path>
                </svg>
                Google API Key
              </label>
              <input
                id="apiKey"
                type="password"
                [(ngModel)]="config.apiKey"
                placeholder="Enter your Google API Key"
              />
              <span class="hint">Create one at Google Cloud Console</span>
            </div>
            <div class="form-group">
              <label for="range">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Sheet Range (optional)
              </label>
              <input
                id="range"
                type="text"
                [(ngModel)]="config.range"
                placeholder="Merged Contacts!A:G"
              />
              <span class="hint">Leave default if columns are A: Name, B: Category, C: Country, D: Address, E: Contact, F: Website, G: Buyer</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="close.emit()">Cancel</button>
            <button class="btn-primary" (click)="saveConfig()" [disabled]="!isValid()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Save Configuration
            </button>
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
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background: var(--surface-color);
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-lg);
      animation: modalSlide 0.3s ease;
    }
    @keyframes modalSlide {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 0;
      position: relative;
    }
    .header-icon {
      width: 48px;
      height: 48px;
      background: var(--primary-light);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      flex-shrink: 0;
    }
    .header-text {
      flex: 1;
    }
    .header-text h2 {
      margin: 0 0 4px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .header-text p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: var(--text-muted);
      border-radius: 8px;
      transition: all 0.2s;
    }
    .close-btn:hover {
      background: var(--bg-color);
      color: var(--text-primary);
    }
    .modal-body {
      padding: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group:last-child {
      margin-bottom: 0;
    }
    .form-group label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .form-group label svg {
      color: var(--text-muted);
    }
    .form-group input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      background: var(--surface-color);
      color: var(--text-primary);
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-group input::placeholder {
      color: var(--text-muted);
    }
    .hint {
      display: block;
      margin-top: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .modal-footer {
      padding: 0 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: var(--bg-color);
      color: var(--text-secondary);
    }
    .btn-secondary:hover {
      background: var(--border-color);
      color: var(--text-primary);
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

  isValid(): boolean {
    return !!(this.config.sheetId?.trim() && this.config.apiKey?.trim());
  }

  saveConfig() {
    if (this.isValid()) {
      this.save.emit({ ...this.config });
    }
  }
}
