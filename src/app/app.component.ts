// Angular
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';

// Services
import { BlogService } from './blog/shared/blog.service';
// import { MailService } from './mail/shared/mail.service';
// import { ngxZendeskWebwidgetService } from 'ngx-zendesk-webwidget';
import { SharedService } from './shared/shared.service';
// import { UsersService } from './users/shared/users.service';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Switch header and footer inside mail view
  isMail = false;
  // When everything is ready, isReady is true and the loader disappears
  // isReady = false;
  // Loading quotes
  // quotes = [];

  // Disable transition on DOM elements on window resize
  // The CSS3 transition creates flickring effect on resize
  public windowIsResized: boolean = false;
  public resizeTimeout: number = null;

  constructor(
    @Inject(DOCUMENT) private document: any,
    public router: Router,
    private blogService: BlogService,
    private sharedService: SharedService,
  ) {
    this.sharedService.isMail
      .subscribe(data => this.isMail = data);
    // this.sharedService.isReady
    //   .subscribe(data => this.isReady = data);
 }

  ngOnInit() {

    // Scroll to the top of each page on routing
    this.router.events.subscribe(params => window.scrollTo(0, 0));
    // Fire loader
    this.loader();
  }

  // Resize event for window object
  @HostListener("window:resize", ['$event'])
  onResize(event) {
    this.windowIsResized = true;
    if (this.resizeTimeout && this.windowIsResized) {
      // this.windowIsResized = true;
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout((() => {
      this.windowIsResized = false;
    }).bind(this), 10);
  }

  loader() {
    this.blogService.cache();
    // this.quote = this.quotes[Math.floor(Math.random() * 5)];
    // window.addEventListener('load', () => {
    //   setTimeout(() => {
    //     this.sharedService.isReady.emit(true);
    //   }, 5000);
    // });
    //
    // if (this.usersService.signedIn()) {
    //   this.usersService.verifyToken().subscribe(_ => {
    //     this.blogService.cache();
    //     this.mailService.cache();
    //     this.usersService.refreshToken().subscribe();
    //   },
    //     error => this.usersService.signOut(),
    //   );
    // } else {
    //   this.blogService.cache();
    //   this.sharedService.isMailReady.emit(true);
    // }
    //
    // this.route.queryParams.subscribe(params => {
    //   if (params['ref']) {
    //     this.sharedService.patchReferrer(params['ref']);
    //     window.history.replaceState(null, null, window.location.pathname);
    //   }});
  }
}
