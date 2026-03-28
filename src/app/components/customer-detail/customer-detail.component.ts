import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-panel">
      <div class="detail-header">
        <div class="header-content">
          <h3>{{ customer().name }}</h3>
          <span class="category-badge">{{ customer().category || 'Uncategorized' }}</span>
        </div>
        <button class="close-btn" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="detail-body">
        <div class="detail-section">
          <h4>Location</h4>
          <div class="detail-row">
            <span class="label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Address
            </span>
            <span class="value">{{ customer().address || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                <path d="M2 12h20M12 2v20"></path>
              </svg>
              Country
            </span>
            <span class="value">{{ customer().country || 'N/A' }}</span>
          </div>
          @if (customer().lat && customer().lng) {
            <div class="detail-row">
              <span class="label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Coordinates
              </span>
              <span class="value coordinates">{{ customer().lat?.toFixed(6) }}, {{ customer().lng?.toFixed(6) }}</span>
            </div>
          }
        </div>

        <div class="detail-section">
          <h4>Contact</h4>
          <div class="detail-row">
            <span class="label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.57 12.57 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.57 12.57 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Phone
            </span>
            <span class="value">{{ customer().contact || 'N/A' }}</span>
          </div>
          @if (customer().website) {
            <div class="detail-row">
              <span class="label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Website
              </span>
              <a [href]="customer().website" target="_blank" rel="noopener" class="website-link">
                {{ customer().website }}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          }
          @if (customer().buyer) {
            <div class="detail-row">
              <span class="label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Buyer
              </span>
              <span class="value">{{ customer().buyer }}</span>
            </div>
          }
        </div>

        <div class="detail-section">
          <h4>Status</h4>
          <div class="status-display">
            @if (customer().geocodeStatus === 'success') {
              <span class="status-indicator success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Successfully located on map
              </span>
            } @else if (customer().geocodeStatus === 'failed') {
              <span class="status-indicator failed">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Could not locate address
              </span>
            } @else {
              <span class="status-indicator pending">
                <span class="spinner"></span>
                Locating...
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-panel {
      position: fixed;
      right: 0;
      top: 60px;
      width: 380px;
      max-height: calc(100vh - 60px);
      background: var(--surface-color);
      border-left: 1px solid var(--border-color);
      z-index: 500;
      animation: slideIn 0.3s ease;
      overflow-y: auto;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 20px 16px;
      background: linear-gradient(to bottom, var(--surface-color), var(--bg-color));
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .header-content {
      flex: 1;
      min-width: 0;
    }
    .detail-header h3 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
    }
    .category-badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 3px 10px;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: 6px;
      font-weight: 500;
    }
    .close-btn {
      background: none;
      border: none;
      padding: 8px;
      margin: -8px;
      cursor: pointer;
      color: var(--text-muted);
      border-radius: 6px;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .close-btn:hover {
      background: var(--bg-color);
      color: var(--text-primary);
    }
    .detail-body {
      padding: 0;
    }
    .detail-section {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }
    .detail-section:last-child {
      border-bottom: none;
    }
    .detail-section h4 {
      margin: 0 0 12px 0;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .detail-row {
      margin-bottom: 12px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .label svg {
      flex-shrink: 0;
    }
    .value {
      font-size: 0.875rem;
      color: var(--text-primary);
      line-height: 1.5;
    }
    .coordinates {
      font-family: 'SF Mono', monospace;
      font-size: 0.8125rem;
      background: var(--bg-color);
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .website-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color);
      font-size: 0.875rem;
      text-decoration: none;
      word-break: break-all;
    }
    .website-link:hover {
      text-decoration: underline;
    }
    .status-display {
      padding: 12px;
      border-radius: 8px;
      background: var(--bg-color);
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status-indicator.success {
      color: var(--success-color);
    }
    .status-indicator.failed {
      color: var(--error-color);
    }
    .status-indicator.pending {
      color: #d97706;
    }
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #d97706;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .detail-panel {
        width: 100%;
        top: auto;
        bottom: 0;
        max-height: 60vh;
        animation: slideUp 0.3s ease;
        border-left: none;
        border-top: 1px solid var(--border-color);
      }
      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    }
  `]
})
export class CustomerDetailComponent {
  customer = input.required<Customer>();
  close = output<void>();
}
