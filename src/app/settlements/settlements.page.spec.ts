import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettlementsPage } from './settlements.page';

describe('SettlementsPage', () => {
  let component: SettlementsPage;
  let fixture: ComponentFixture<SettlementsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SettlementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
