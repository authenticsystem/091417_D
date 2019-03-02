import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ShortUniqueId } from '../shortUniqueId.js';
import { capitalizeString, fbSnapshotToArray } from '../shared-functions.js';
import 'g-element/elements/g-datatable/g-datatable.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';

class MySecretary extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.secretary = [];
        this.isLoading = true;
        this.isDisabled = true;
        this.selectedPage = "List";
        this.selectedItem = null;
        this.data = { name: {} };
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display:block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }
            .list { padding: 0 };

            @media (max-width: 480px) {
                .list { margin: 0; }
            }

            paper-spinner {
                width: 20px;
                height: 20px;
            }

            @media (min-width: 480px) {
                .phone { width:50%; }
            }

            .toolbar-select {
                display: flex;
                background: var(--paper-pink-50);
                color: var(--accent-color);
                padding: 6px;
            }
        </style>

        <iron-pages attr-for-selected="name" selected="[[selectedPage]]">
            <div name="List">
                <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
                    <app-header-layout id="headerLayout" has-scrolling-region="">
                        <app-header fixed="" slot="header">
                            <app-toolbar primary="">
                                <a href="/settings">
                                    <paper-icon-button class="main" icon="my-icons:arrow-back"></paper-icon-button>
                                </a>
                                <div main-title="">My Secretary</div>
                            </app-toolbar>
                        </app-header>

                        <div class="polymer-card list">
                            <div hidden="[[!selectedItem]]" class="toolbar-select">
                                <div style="padding:6px; margin-left:6px; flex: 1;">
                                    [[_text(selectedItem)]]
                                </div>
                                <div style="text-align:right; flex: 1;">
                                    <paper-icon-button icon="my-icons:check" no-ink="" on-tap="_yes"></paper-icon-button>
                                    <paper-icon-button icon="my-icons:close" no-ink="" on-tap="_no"></paper-icon-button>
                                </div>
                            </div>

                            <div style="padding: 16px;">
                                <g-datatable id="datatable" data="[[secretary]]" selectable selected-item="{{selectedItem}}">
                                    <div hidden="[[!isLoading]]" slot="no-results">Loading data...</div>
                                    <div hidden="[[isLoading]]" slot="no-results">No data found.</div>
                                    <g-datatable-column header="Account Code" type="String" property="code"></g-datatable-column>
                                    <g-datatable-column header="Name" type="Object" property="name">
                                        <template>
                                            <span>[[value.firstname]]</span>
                                            <span>[[value.middlename]]</span>
                                            <span>[[value.lastname]]</span>
                                            <span>[[value.suffix]]</span>
                                        </template>
                                    </g-datatable-column>
                                    <g-datatable-column header="Location" type="String" property="location"></g-datatable-column>
                                    <g-datatable-column header="Cellphone" type="String" property="cellphone"></g-datatable-column>
                                    <g-datatable-column header="Active" type="Boolean" property="active"></g-datatable-column>
                                </g-datatable>
                            </div>
                        </div>
                    </app-header-layout>

                    <paper-fab class="fab-menu" icon="my-icons:person-add" on-tap="_new"></paper-fab>
                </app-drawer-layout>
            </div>

            <div name="Form">
                ${this.Form};
            </div>
        </iron-pages>
        `;
    }

    static get Form() {
        return html`
            <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
                <app-header-layout id="headerLayout" has-scrolling-region="">
                    <app-header fixed="" slot="header">
                        <app-toolbar primary="">
                            <paper-icon-button class="main" icon="my-icons:arrow-back" on-tap="_showList"></paper-icon-button>
                            <div main-title="">[[header]]</div>
                        </app-toolbar>
                    </app-header>
            
                    <div class="polymer-card">
                        <iron-form id="form">
                            <form>
                                <paper-input class="phone" required allowed-pattern="[\\d]" prevent-invalid-input="" maxlength="10"
                                    minLength="10" value="{{cellphone}}" always-float-label label="Cellphone *">
                                    <div slot="prefix">+63</div>
                                    <div slot="suffix">
                                        <paper-spinner active="[[isFetching]]"></paper-spinner>
                                    </div>
                                </paper-input>
                                <paper-dropdown-menu disabled="[[isDisabled]]" required label="Assigned location *"
                                    always-float-label>
                                    <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name"
                                        selected="{{selectedLocation}}">
                                        <template is="dom-repeat" items="[[locations]]">
                                            <paper-item name="[[item.location_name]]~[[item.location_mini]]~[[item.location_code]]">[[item.location_mini]]</paper-item>
                                        </template>
                                    </paper-listbox>
                                </paper-dropdown-menu>
                                <paper-input disabled="[[isDisabled]]" required pattern="[a-zA-Z-. ]*" value="{{data.name.firstname}}"
                                    always-float-label label="First Name *"></paper-input>
                                <paper-input disabled="[[isDisabled]]" pattern="[a-zA-Z-. ]*" value="{{data.name.middlename}}"
                                    always-float-label label="Middle Name"></paper-input>
                                <paper-input disabled="[[isDisabled]]" required pattern="[a-zA-Z-. ]*" value="{{data.name.lastname}}"
                                    always-float-label label="Last Name *"></paper-input>
                                <paper-input disabled="[[isDisabled]]" pattern="[a-zA-Z-. ]*" value="{{data.name.suffix}}"
                                    always-float-label label="Suffix"></paper-input>
            
                                <div style="text-align: right; margin-top: -36px;">
                                    <paper-button id="saveBtn" on-tap="_save" class="primary">Save</paper-button>
                                    <paper-button on-tap="_showList" class="secondary">Cancel</paper-button>
                                </div>
                            </form>
                        </iron-form>
                    </div>
                </app-header-layout>
            </app-drawer-layout>
        `;
    }

    static get properties() {
        return {
            myData: Object
        }
    }

    static get observers() {
        return [
            '_phoneChanged(cellphone)',
            '_nameChanged(data.name.firstname, data.name.lastname)',
            // '_selectedItemChanged(selectedItem)'
        ];
    }

    ready() {
        super.ready();
        this.firebaseRef.child("/" + this.myData.code + "/secretary").orderByChild("name/firstname").on("value", function (snapshot) {
            this.isLoading = false;
            if (snapshot.exists()) this.secretary = fbSnapshotToArray(snapshot);
        }.bind(this));
    }

    _nameChanged(fname, lname) {
        if (fname) this.set('data.name.firstname', capitalizeString(fname));
        if (lname) this.set('data.name.lastname', capitalizeString(lname));
    }

    _phoneChanged(phone) {
        if (phone && phone.length == 10) {
            this.isFetching = true;
            this.firebaseRef.child("/accounts").orderByChild("cellphone").equalTo(phone).once('value', function (snapshot) {
                this.isDisabled = false;
                this.isFetching = false;
                if (snapshot.exists()) {
                    const data = Object.values(snapshot.val())[0];
                    if (data.role === "Secretary") {
                        this.data = data;
                        this.selectedLocation = this.data.location + "~" + this.data.location_mini + "~" + this.data.location_code;
                    }
                }
            }.bind(this));
        } else {
            this.selectedLocation = null;
            this.data = { name: {} };
            this.isDisabled = true;
        }
    }

    _yes() {
        this.firebaseRef.child("/" + this.myData.code + "/secretary/" + this.selectedItem.$key).update({ active: !this.selectedItem.active });
        var doctorRef = this.firebaseRef.child("/" + this.selectedItem.code + "/doctors");
        doctorRef.orderByChild("code").equalTo(this.myData.code).once("value").then(function (snapshot) {
            if (snapshot.exists()) doctorRef.child(Object.keys(snapshot.val())[0]).update({ location: "" });
        });
        this._no();
    }

    _no() { this.$.datatable.deselect(this.selectedItem); }
    _text(e) {
        if (e) {
            if (e.active) return "Deactivate secretary?";
            return "Activate secretary?";
        }
    }

    _new() {
        this.header = "New Secretary";
        this.$.form.reset();
        this._fetchLocations();
        this.data = { name: {} };
        this.selectedPage = "Form";
    }

    _showList() { this.selectedPage = "List"; }
    _save() {
        if (this.$.form.validate()) {
            if (this.secretary.some(x => x.cellphone === this.cellphone)) return alert("Secretary already exist!");
            this.data.code = this._generateCode();
            this.data.active = false;
            this.data.role = 'Secretary';
            this.data.designatory = 'Secretary';
            this.data.cellphone = this.cellphone;
            this.data.uid = '';
            this.data.name.middlename = this.data.name.middlename ? this.data.name.middlename : '';
            this.data.name.suffix = this.data.name.suffix ? this.data.name.suffix : '';

            const accountsRef = this.firebaseRef.child("/accounts").push();
            const secretaryRef = this.firebaseRef.child("/" + this.myData.code + "/secretary").push();
            const doctorsRef = this.firebaseRef.child("/" + this.data.code + "/doctors").push();

            var updateAtOnce = {};
            var [locationName, locationMini, locationCode] = this.selectedLocation.split('~');

            updateAtOnce['/accounts/' + accountsRef.key] = this.data;
            this.data.active = true;
            this.data.location = locationMini;
            this.data.location_code = locationCode;
            updateAtOnce['/' + this.myData.code + '/secretary/' + secretaryRef.key] = this.data;
            updateAtOnce['/' + this.data.code + '/doctors/' + doctorsRef.key] = {
                lastname: this.myData.name.lastname,
                code: this.myData.code,
                location: locationMini,
                location_code: locationCode
            };

            const push = this.firebaseRef.update(updateAtOnce).catch(error => { return "Denied!" });
            if (push === "Denied!") return alert("Something went wrong saving the data! Please try again later.");
            const locationRef = this.firebaseRef.child("/" + this.data.code + "/locations");
            locationRef.orderByChild("location_mini").equalTo(locationMini).once('value').then(function (data) {
                if (!data.exists()) {
                    locationRef.push({
                        code: this.myData.code,
                        location_active: false,
                        location_name: locationName,
                        location_mini: locationMini,
                        location_code: locationCode
                    });
                }
            }.bind(this));
            alert("Secretary successfully added!");
            this._showList();
        } else {
            alert("Please fill-up all the required fields!");
        }
    }

    _generateCode() {
        const uid = new ShortUniqueId();
        return uid.randomUUID(7);
    }

    _fetchLocations() {
        this.firebaseRef.child('/' + this.myData.code + '/locations').orderByChild('location_name').once('value', function (snapshot) {
            this.locations = fbSnapshotToArray(snapshot);
        }.bind(this));
    }
}

window.customElements.define('my-secretary', MySecretary);