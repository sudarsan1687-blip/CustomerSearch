import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigModalComponent } from './config-modal.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { GoogleSheetConfig } from '../../models/customer.model';

describe('ConfigModalComponent', () => {
  let component: ConfigModalComponent;
  let fixture: ComponentFixture<ConfigModalComponent>;

  const mockConfig: GoogleSheetConfig = {
    sheetId: 'test-sheet-id',
    apiKey: 'test-api-key',
    range: 'Test Range'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigModalComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show modal when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.modal-overlay'))).toBeNull();

    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.modal-overlay'))).toBeTruthy();
  });

  it('should display initial config values', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('initialConfig', mockConfig);
    fixture.detectChanges();

    const sheetIdInput = fixture.debugElement.query(By.css('#sheetId')).nativeElement;
    const apiKeyInput = fixture.debugElement.query(By.css('#apiKey')).nativeElement;

    expect(sheetIdInput.value).toBe('test-sheet-id');
    expect(apiKeyInput.value).toBe('test-api-key');
  });

  it('should emit close event when close button clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const closeSpy = spyOn(component.close, 'emit');
    const closeBtn = fixture.debugElement.query(By.css('.close-btn')).nativeElement;
    closeBtn.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit close event when clicking overlay', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const closeSpy = spyOn(component.close, 'emit');
    const overlay = fixture.debugElement.query(By.css('.modal-overlay')).nativeElement;
    overlay.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit save event with config when save clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('initialConfig', null);
    fixture.detectChanges();

    const saveSpy = spyOn(component.save, 'emit');

    const sheetIdInput = fixture.debugElement.query(By.css('#sheetId')).nativeElement;
    const apiKeyInput = fixture.debugElement.query(By.css('#apiKey')).nativeElement;

    sheetIdInput.value = 'new-sheet-id';
    sheetIdInput.dispatchEvent(new Event('input'));
    apiKeyInput.value = 'new-api-key';
    apiKeyInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const saveBtn = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;
    saveBtn.click();

    expect(saveSpy).toHaveBeenCalledWith({
      sheetId: 'new-sheet-id',
      apiKey: 'new-api-key',
      range: 'Merged Contacts!A:G'
    });
  });

  it('should not emit save if required fields are empty', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('initialConfig', null);
    fixture.detectChanges();

    const saveSpy = spyOn(component.save, 'emit');

    const saveBtn = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;
    saveBtn.click();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should emit cancel when cancel button clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const closeSpy = spyOn(component.close, 'emit');
    const cancelBtn = fixture.debugElement.query(By.css('.btn-secondary')).nativeElement;
    cancelBtn.click();

    expect(closeSpy).toHaveBeenCalled();
  });
});
