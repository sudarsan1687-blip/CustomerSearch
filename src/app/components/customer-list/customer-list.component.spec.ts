import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerListComponent } from './customer-list.component';
import { By } from '@angular/platform-browser';
import { Customer } from '../../models/customer.model';

describe('CustomerListComponent', () => {
  let component: CustomerListComponent;
  let fixture: ComponentFixture<CustomerListComponent>;

  const mockCustomers: Customer[] = [
    { id: '1', name: 'ABC Corp', category: 'Retail', country: 'USA', address: '123 Main St', contact: '+1-555-0100', website: 'www.abc.com', buyer: 'John', geocodeStatus: 'success', lat: 40.7128, lng: -74.0060 },
    { id: '2', name: 'XYZ Ltd', category: 'Wholesale', country: 'UK', address: '456 High St', contact: '+44-20-7946', website: 'www.xyz.com', buyer: 'Jane', geocodeStatus: 'failed' },
    { id: '3', name: 'Global Trade', category: 'Import', country: 'Germany', address: '789 Market St', contact: '+49-30-1234', website: 'www.global.de', buyer: 'Hans', geocodeStatus: 'success', lat: 52.5200, lng: 13.4050 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('customers', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display customer count in header', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('.list-header h3')).nativeElement;
    expect(header.textContent).toContain('Customers (3)');
  });

  it('should render all customer cards', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards.length).toBe(3);
  });

  it('should display customer details correctly', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const firstCard = fixture.debugElement.query(By.css('.customer-card')).nativeElement;
    expect(firstCard.textContent).toContain('ABC Corp');
    expect(firstCard.textContent).toContain('Retail');
    expect(firstCard.textContent).toContain('123 Main St');
    expect(firstCard.textContent).toContain('USA');
  });

  it('should show mapped badge for geocoded customers', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const badges = fixture.debugElement.queryAll(By.css('.status-badge'));
    const successBadges = badges.filter(b => b.nativeElement.classList.contains('success'));
    const failedBadges = badges.filter(b => b.nativeElement.classList.contains('failed'));

    expect(successBadges.length).toBe(2);
    expect(failedBadges.length).toBe(1);
  });

  it('should emit select event when card clicked', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const selectSpy = spyOn(component.select, 'emit');
    const firstCard = fixture.debugElement.query(By.css('.customer-card')).nativeElement;
    firstCard.click();

    expect(selectSpy).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('should highlight selected customer', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.componentRef.setInput('selectedCustomer', mockCustomers[0]);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards[0].nativeElement.classList.contains('active')).toBe(true);
    expect(cards[1].nativeElement.classList.contains('active')).toBe(false);
  });

  it('should filter customers by search term', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('.search-input')).nativeElement;
    searchInput.value = 'USA';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards.length).toBe(1);
    expect(cards[0].nativeElement.textContent).toContain('ABC Corp');
  });

  it('should filter by name', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('.search-input')).nativeElement;
    searchInput.value = 'XYZ';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards.length).toBe(1);
    expect(cards[0].nativeElement.textContent).toContain('XYZ Ltd');
  });

  it('should filter by address', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('.search-input')).nativeElement;
    searchInput.value = 'High St';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards.length).toBe(1);
    expect(cards[0].nativeElement.textContent).toContain('XYZ Ltd');
  });

  it('should show empty state when no customers match', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('.search-input')).nativeElement;
    searchInput.value = 'Nonexistent';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('No customers found');
  });

  it('should show mapped styling for mapped customers', () => {
    fixture.componentRef.setInput('customers', mockCustomers);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.customer-card'));
    expect(cards[0].nativeElement.classList.contains('mapped')).toBe(true);
    expect(cards[1].nativeElement.classList.contains('unmapped')).toBe(true);
  });
});
