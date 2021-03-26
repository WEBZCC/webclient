import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AppState, Contact, ContactsState, UserState } from '../../../store/datatypes';
import { ContactAdd } from '../../../store';
import { OpenPgpService } from '../../../store/services';

@UntilDestroy()
@Component({
  selector: 'app-save-contact',
  templateUrl: './save-contact.component.html',
  styleUrls: ['./save-contact.component.scss', './../mail-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveContactComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() selectedContact: Contact;

  @Output() userSaved = new EventEmitter<boolean>();

  @ViewChild('newContactForm') newContactForm: NgForm;

  newContactModel: Contact = {
    name: '',
    email: '',
    address: '',
    note: '',
    phone: '',
    enabled_encryption: false,
    public_key: '',
  };

  public inProgress: boolean;

  public internalUser: boolean;

  private isContactsEncrypted: boolean;

  constructor(private store: Store<AppState>, private openpgp: OpenPgpService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.handleUserState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Get contactEmail, Domain and check if this is internalUser with domain
    this.newContactModel = { ...this.selectedContact };
    const contactEmail = this.newContactModel.email;
    const getDomain = contactEmail.substring(contactEmail.indexOf('@') + 1, contactEmail.length);
    this.internalUser = getDomain === 'ctemplar.com';
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private handleUserState(): void {
    this.store
      .select(state => state.user)
      .pipe(untilDestroyed(this))
      .subscribe((userState: UserState) => {
        this.isContactsEncrypted = userState.settings.is_contacts_encrypted; // set encryption from user settings
      });

    this.store
      .select(state => state.contacts)
      .pipe(untilDestroyed(this))
      .subscribe((contactsState: ContactsState) => {
        if (this.inProgress && !contactsState.inProgress) {
          this.inProgress = false;
          if (!contactsState.isError) {
            this.userSaved.emit(true);
          }
        }
      });
  }

  createNewContact() {
    if (this.newContactForm.invalid) {
      return false;
    }
    this.newContactModel.email = this.newContactModel.email.toLocaleLowerCase();
    if (this.isContactsEncrypted) {
      this.openpgp.encryptContact(this.newContactModel);
    } else {
      this.store.dispatch(new ContactAdd(this.newContactModel));
    }
    this.inProgress = true;
  }

  clearPublicKey() {
    this.newContactModel.public_key = '';
    return false;
  }
}
