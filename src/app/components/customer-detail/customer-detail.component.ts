import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-panel">
      <!-- Header with gradient -->
      <div class="detail-header">
        <button class="close-btn" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="header-content">
          <div class="customer-avatar">
            {{ customer().name.charAt(0).toUpperCase() }}
          </div>
          <div class="customer-info">
            <h3>{{ customer().name }}</h3>
            @if (customer().category) {
              <span class="category-badge">{{ customer().category }}</span>
            }
          </div>
        </div>
        <div class="status-badge" [class]="customer().geocodeStatus">
          @if (customer().geocodeStatus === 'success') {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Mapped</span>
          } @else if (customer().geocodeStatus === 'failed') {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>Not Found</span>
          } @else {
            <span class="spinner"></span>
            <span>Locating...</span>
          }
        </div>
      </div>

      <!-- Body with sections -->
      <div class="detail-body">
        <!-- Location Section -->
        <div class="section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Location</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Address</span>
              <span class="value">{{ customer().address || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Country</span>
              <span class="value">{{ customer().country || 'N/A' }}</span>
            </div>
            @if (customer().lat && customer().lng) {
              <div class="info-row">
                <span class="label">Coordinates</span>
                <span class="value mono">{{ customer().lat?.toFixed(6) }}, {{ customer().lng?.toFixed(6) }}</span>
              </div>
            }
            @if (customer().distance) {
              <div class="info-row">
                <span class="label">Distance</span>
                <span class="value distance">{{ customer().distance?.toFixed(1) }} km from center</span>
              </div>
            }
          </div>
        </div>

        <!-- Contact Section -->
        <div class="section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.57 12.57 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.57 12.57 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Contact</span>
          </div>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Phone</span>
              <span class="value">{{ customer().contact || 'N/A' }}</span>
            </div>
            @if (customer().email) {
              <div class="info-row">
                <span class="label">Email</span>
                <a [href]="'mailto:' + customer().email" class="value link">
                  {{ customer().email }}
                </a>
              </div>
            }
            @if (customer().website) {
              <div class="info-row">
                <span class="label">Website</span>
                <a [href]="customer().website" target="_blank" rel="noopener" class="value link">
                  {{ customer().website }}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            }
          </div>
        </div>

        <!-- Buyer Section -->
        @if (customer().buyer) {
          <div class="section">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Buyer</span>
            </div>
            <div class="section-content">
              <div class="info-row">
                <span class="value highlight">{{ customer().buyer }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Notes Section -->
        @if (customer().notes) {
          <div class="section">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Notes</span>
            </div>
            <div class="section-content">
              <div class="info-row">
                <span class="value notes-text">{{ customer().notes }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Footer Actions -->
      <div class="detail-footer">
        @if (customer().lat && customer().lng) {
          <button class="action-btn primary" (click)="openInGoogleMaps()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Open in Google Maps
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-color);
    }

    .detail-header {
      background: var(--primary-gradient);
      padding: 20px;
      position: relative;
      flex-shrink: 0;
      max-height: 140px;
    }

    /* Header with gradient background */
    .detail-header {
      background: var(--primary-gradient);
      padding: 20px;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .customer-avatar {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      backdrop-filter: blur(10px);
    }

    .customer-info {
      flex: 1;
      min-width: 0;
    }

    .customer-info h3 {
      margin: 0 0 6px 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: white;
      backdrop-filter: blur(10px);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      backdrop-filter: blur(10px);
    }

    .status-badge.success {
      background: rgba(0, 200, 83, 0.3);
    }

    .status-badge.failed {
      background: rgba(255, 82, 82, 0.3);
    }

    .spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Body */
    .detail-body {
      flex: 1;
      overflow-y: scroll;
      padding: 0;
      background: var(--bg-color);
    }

    /* Custom scrollbar styling */
    .detail-body::-webkit-scrollbar {
      width: 8px;
    }

    .detail-body::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .detail-body::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
    }

    .detail-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #5a67d8 0%, #6b4691 100%);
    }

    .section {
      margin-bottom: 1px;
      background: var(--surface-color);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(to right, var(--primary-light), transparent);
      border-bottom: 1px solid var(--border-color);
    }

    .section-header svg {
      color: var(--primary-color);
    }

    .section-header span {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-primary);
    }

    .section-content {
      padding: 16px 20px;
    }

    .info-row {
      margin-bottom: 16px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 6px;
    }

    .value {
      display: block;
      font-size: 0.9375rem;
      color: var(--text-primary);
      line-height: 1.6;
    }

    .value.mono {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      background: var(--bg-color);
      padding: 6px 10px;
      border-radius: 6px;
      display: inline-block;
      font-size: 0.8125rem;
    }

    .value.distance {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      background: var(--success-bg);
      color: var(--success-color);
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8125rem;
    }

    .value.highlight {
      font-weight: 600;
      color: var(--primary-color);
      padding: 8px 12px;
      background: var(--primary-light);
      border-radius: 8px;
    }

    .value.link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color);
      text-decoration: none;
      word-break: break-all;
    }

    .value.link:hover {
      text-decoration: underline;
    }

    .value.notes-text {
      white-space: pre-wrap;
      word-break: break-word;
      background: var(--bg-color);
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      line-height: 1.7;
    }

    /* Footer */
    .detail-footer {
      padding: 16px 20px;
      background: var(--surface-color);
      border-top: 1px solid var(--border-color);
    }

    .action-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn.primary {
      background: var(--primary-gradient);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
  `]
})
export class CustomerDetailComponent {
  customer = input.required<Customer>();
  close = output<void>();

  openInGoogleMaps() {
    const c = this.customer();
    if (c.lat && c.lng) {
      window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`, '_blank');
    }
  }
}
