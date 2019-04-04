
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ShortUniqueId } from 'g-element/src/shortUniqueId.js';
import { capitalizeString } from 'g-element/src/sharedFunctions.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import 'g-element/elements/g-datatable/g-datatable.js';

class MyNewUser extends PolymerElement {
    constructor() {
        super();
        this._generateCode();
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display:block;
            }      

            @media (min-width: 800px) {
                .info {
                    display: flex;
                }

                .info paper-input{
                    width:50%; 
                    margin-left: 10px;
                }
            }
        </style>
        
        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">
              <app-toolbar primary="">
                <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                <div main-title="">New User</div>
              </app-toolbar>
            </app-header>

            <div class="polymer-card">
                <iron-form id="form">
                    <form>
                        <paper-input disabled value="{{code}}" style="max-width: 205px"  label="Account Code"></paper-input>
                        <div class="info">
                            <paper-dropdown-menu required style="cursor:pointer;" always-float-label label="Role *">
                                <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{role}}">
                                    <paper-item name="Doctor">Doctor</paper-item>
                                    <paper-item name="System Admin">System Admin</paper-item>
                                </paper-listbox>
                            </paper-dropdown-menu>

                            <paper-input required allowed-pattern="[\\d]" prevent-invalid-input="" maxlength="10" minLength="10" value="{{cellphone}}" always-float-label label="Cellphone *">
                                <div slot="prefix">+63</div>
                            </paper-input>
                        </div>
                        <paper-input on-keyup="_onEnter" required pattern="[a-zA-Z-.-/ ]*" value="{{prefix}}" always-float-label label="Designatory letters *" placeholder="e.g. MD"></paper-input>
                        <paper-input on-keyup="_onEnter" required value="{{firstname}}" always-float-label label="First Name *"></paper-input>
                        <paper-input on-keyup="_onEnter" value="{{middlename}}" always-float-label label="Middle Name"></paper-input>
                        <paper-input on-keyup="_onEnter" required value="{{lastname}}" always-float-label label="Last Name *"></paper-input>
                        <paper-input on-keyup="_onEnter" value="{{suffix}}" always-float-label label="Suffix"></paper-input>
                        <paper-input on-keyup="_onEnter" required value="{{location_name}}" always-float-label label="Location *"></paper-input>
                        <paper-input on-keyup="_onEnter" required value="{{location_mini}}" always-float-label label="Location mini *"></paper-input>
                    
                        <div style="text-align: right; margin-top: -36px;">
                            <paper-button id="saveBtn" on-tap="_save" class="primary">Save</paper-button>
                        </div>
                    </form>
                </iron-form>
            </div>
        </app-header-layout>
    `;
    }

    static get observers() {
        return [
            '_inputChanged(firstname, lastname, location_name, location_mini)'
        ];
    }

    ready() {
        super.ready();
        this.code = this._generateCode();
    }

    _inputChanged(fname, lname, location, location_mini) {
        if (fname) this.firstname = capitalizeString(fname);
        if (lname) this.lastname = capitalizeString(lname);
        if (location) this.location_name = capitalizeString(location);
        if (location_mini) this.location_mini = location_mini.toUpperCase();
    }

    _save() {
        if (this.$.form.validate()) {
            this.$.saveBtn.disabled = true;
            const locationCode = this._generateCode();
            const accountRef = firebase.database().ref("/accounts").push();
            const locationRef = firebase.database().ref("/" + this.code + "/locations").push();

            var updateAtOnce = {};
            updateAtOnce["/accounts/" + accountRef.key] = {
                code: this.code,
                active: false,
                name: {
                    firstname: this.firstname,
                    middlename: this.middlename ? this.middlename : '',
                    lastname: this.lastname,
                    suffix: this.suffix ? this.suffix : ''
                },
                role: this.role,
                designatory: this.prefix,
                cellphone: this.cellphone,
                uid: '',
                location: this.location_name,
                location_code: locationCode
            };
            updateAtOnce["/" + this.code + "/locations/" + locationRef.key] = {
                location_active: true,
                location_code: locationCode,
                location_name: this.location_name,
                location_mini: this.location_mini
            };

            firebase.database().ref().update(updateAtOnce).then(() => {
                alert('User successfully added!');
                this.$.saveBtn.disabled = false;
                this.$.form.reset();
                this.code = this._generateCode();
                window.history.pushState({}, null, '/');
                window.dispatchEvent(new CustomEvent('location-changed'));
            }).catch(error => {
                alert("Error while saving data! Please try again later.");
            });
        } else {
            alert('Please fill-up all the required fields with a valid value!');
        }
    }

    _onEnter(e) {
        if (e.keyCode === 13) this._save()
    }

    _generateCode() {
        const uid = new ShortUniqueId();
        return uid.randomUUID(7);
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }
}

window.customElements.define('my-new-user', MyNewUser);
