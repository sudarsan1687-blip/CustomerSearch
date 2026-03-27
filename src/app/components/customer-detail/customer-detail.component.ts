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
        <h3>{{ customer().name }}</h3>
        <button class="close-btn" (click)="close.emit()">×</button>
      </div>
      <div class="detail-body">
        <div class="detail-row">
          <span class="label">Category:</span>
          <span class="value">{{ customer().category || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Country:</span>
          <span class="value">{{ customer().country || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Address:</span>
          <span class="value">{{ customer().address || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Contact:</span>
          <span class="value">{{ customer().contact || 'N/A' }}</span>
        </div>
        @if (customer().website) {
          <div class="detail-row">
            <span class="label">Website:</span>
            <a [href]="customer().website" target="_blank" rel="noopener">{{ customer().website }}</a>
          </div>
        }
        @if (customer().buyer) {
          <div class="detail-row">
            <span class="label">Buyer:</span>
            <span class="value">{{ customer().buyer }}</span>
          </div>
        }
        @if (customer().lat && customer().lng) {
          <div class="detail-row">
            <span class="label">Coordinates:</span>
            <span class="value">{{ customer().lat?.toFixed(6) }}, {{ customer().lng?.toFixed(6) }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-panel {
      position: fixed;
      right: 0;
      top: 60px;
      width: 350px;
      max-height: calc(100vh - 60px);
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      z-index: 500;
      animation: slideIn 0.3s ease;
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
      align-items: center;
      padding: 15px 20px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .detail-body {
      padding: 20px;
      overflow-y: auto;
    }
    .detail-row {
      margin-bottom: 15px;
    }
    .label {
      display: block;
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .value {
      font-size: 0.95rem;
      color: #333;
    }
    a {
      color: #1976d2;
      word-break: break-all;
    }
    @media (max-width: 768px) {
      .detail-panel {
        width: 100%;
        top: auto;
        bottom: 0;
        max-height: 50vh;
        animation: slideUp 0.3s ease;
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
