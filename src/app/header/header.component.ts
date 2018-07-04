// Angular
import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';

// Service
import { SharedService } from '../store/services';
import { UsersService } from '../store/services/users.service';
import { AppState, AuthState } from '../store/datatypes';
import { Store } from '@ngrx/store';
import { Logout } from '../store/actions';
import { OnDestroy, TakeUntilDestroy } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs/Observable';

@TakeUntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly destroyed$: Observable<boolean>;

  // Public property of boolean type set false by default
  public navIsFixed: boolean = false;
  public menuIsOpened: boolean = false;

  // Switch the footer call to action for this view.
  externalPageCallToAction: boolean = false;
  isLoggedIn: boolean;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private route: ActivatedRoute,
    public router: Router,
    private sharedService: SharedService,
    public usersService: UsersService,
    private store: Store<AppState>
  ) {
    this.sharedService.isExternalPage.subscribe(data => (this.externalPageCallToAction = data));
  }

  ngOnInit() {
    this.isLoggedIn = this.usersService.getToken() ? true : false;
    this.store.select(state => state.auth).takeUntil(this.destroyed$)
      .subscribe((data: AuthState) => this.isLoggedIn = data.isAuthenticated);
  }

  // == Setup click event to toggle mobile menu
  toggleState() { // click handler
    const bool = this.menuIsOpened;
    this.menuIsOpened = bool === false ? true : false;
  }

  // == Listening to scroll event for window object
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const number = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    if (number > document.getElementById('mastHead').offsetHeight) {
      this.navIsFixed = true;
    } else if (this.navIsFixed && number < 10) {
      this.navIsFixed = false;
    }
  }

  closeMenu() {
    this.menuIsOpened = false;
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  ngOnDestroy(): void {
  }
}
