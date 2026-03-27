import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailComponent } from './customer-detail.component';
import { By } from '@angular/platform-browser';
import { Customer } from '../../models/customer.model';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;

  const mockCustomer: Customer = {
    id: '1',
    name: 'ABC Corp',
    category: 'Retail',
    country: 'USA',
    address: '123 Main St, New York, NY 10001',
    contact: '+1-555-0100',
    website: 'https://www.abccorp.com',
    buyer: 'John Doe',
    geocodeStatus: 'success',
    lat: 40.7128,
    lng: -74.0060
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display customer name in header', () => {
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('.detail-header h3')).nativeElement;
    expect(header.textContent).toBe('ABC Corp');
  });

  it('should display all customer fields', () => {
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();

    const detailBody = fixture.debugElement.query(By.css('.detail-body')).nativeElement;
    expect(detailBody.textContent).toContain('Retail');
    expect(detailBody.textContent).toContain('USA');
    expect(detailBody.textContent).toContain('123 Main St');
    expect(detailBody.textContent).toContain('+1-555-0100');
    expect(detailBody.textContent).toContain('John Doe');
    expect(detailBody.textContent).toContain('40.712800');
    expect(detailBody.textContent).toContain('-74.006000');
  });

  it('should show website as link', () => {
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();

    const websiteLink = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(websiteLink.href).toContain('https://www.abccorp.com');
    expect(websiteLink.textContent).toBe('https://www.abccorp.com');
  });

  it('should emit close event when close button clicked', () => {
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();

    const closeSpy = spyOn(component.close, 'emit');
    const closeBtn = fixture.debugElement.query(By.css('.close-btn')).nativeElement;
    closeBtn.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle customer with missing optional fields', () => {
    const partialCustomer: Customer = {
      ...mockCustomer,
      website: '',
      buyer: '',
      lat: undefined,
      lng: undefined
    };

    fixture.componentRef.setInput('customer', partialCustomer);
    fixture.detectChanges();

    const detailBody = fixture.debugElement.query(By.css('.detail-body')).nativeElement;
    expect(detailBody.textContent).not.toContain('https://www.abccorp.com');
    expect(detailBody.textContent).not.toContain('John Doe');
    expect(detailBody.textContent).not.toContain('Coordinates');
  });

  it('should show N/A for empty string fields', () => {
    const emptyCustomer: Customer = {
      ...mockCustomer,
      category: '',
      country: '',
      contact: ''
    };

    fixture.componentRef.setInput('customer', emptyCustomer);
    fixture.detectChanges();

    const detailBody = fixture.debugElement.query(By.css('.detail-body')).nativeElement;
    expect(detailBody.textContent).toContain('N/A');
  });
});
