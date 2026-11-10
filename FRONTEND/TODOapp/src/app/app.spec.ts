import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        App
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, TODOapp');
  });

  it('should call login when clicking the login button', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const spy = spyOn(app, 'login');

    const username = fixture.nativeElement.querySelector('input[placeholder="nome"]') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('input[placeholder="senha"]') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button.btn-primary') as HTMLButtonElement;

    username.value = 'branqs';
    password.value = '1234';
    button.click();

    expect(spy).toHaveBeenCalledWith('branqs', '1234');
  });
  
});
