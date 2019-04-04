import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { itemStyles } from '../shared-styles2.js';
import { capitalizeString, fbSnapshotToArray } from 'g-element/src/sharedFunctions.js';
import { ShortUniqueId } from 'g-element/src/shortUniqueId.js';
import 'g-element/elements/g-avatar';
import '@polymer/paper-dialog/paper-dialog.js';

class UserLocation extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.firstLoad = true;
        this.locations = [];
        this.data = {};
    }

    static get template() {
        return html`
        ${itemStyles}
        <style include="shared-styles">
            a { color: #fff; }
            a:hover { color: #fff; }
            .locate {
                display: inline-block;
                position: absolute; 
                right: 10px; 
                color: #673AB7;
                top:18px;
            }
        </style>

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-header-layout id="headerLayout" has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar primary="">
                        <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                        <div main-title="">My Locations</div>
                    </app-toolbar>
                </app-header>

                <template is="dom-if" if="[[firstLoad]]">
                    <div id="noRecord">
                        <div class="item center">
                            <div style="margin:auto">
                                Loading data...
                            </div>
                        </div>
                    </div>
                </template>
            
                <template is="dom-if" if="[[_noData(locations.length, firstLoad)]]">
                    <div id="noRecord">
                        <div class="item center">
                            <div style="margin:auto">
                                No data found.
                            </div>
                        </div>
                    </div>
                </template>
            
                <iron-scroll-threshold id="threshold">
                    <iron-list items="[[locations]]">
                        <template>
                            <div class="divSeparator">
                                <div class="item center" on-tap="_select">
                                    <g-avatar class="small" label="[[item.location_name]]"></g-avatar>
                                    <div class="pad">
                                        <div style="font-size:11px" class="long-text">[[item.location_mini]]</div>
                                        <div>[[item.location_name]]</div>
                                    </div>
                                    <div style="padding:10px"></div>
                                    <div hidden="[[!item.location_active]]">
                                        <iron-icon icon="my-icons:my-location" class="locate"></iron-icon>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </iron-list>
                </iron-scroll-threshold>
            </app-header-layout>
                  
            <paper-fab class="fab-menu" icon="my-icons:add" on-tap="_new"></paper-fab>
        </app-drawer-layout>

        <paper-dialog style="width: 476px;" modal id="dialog">
            <h2 style="background: #4285f4; margin: 0; color: #fff; padding: 16px; font-weight: 400; font-size: 16px;">New Location</h2>
            <div>
                <iron-form id="form">
                    <form>
                        <paper-input on-keyup="_onEnter" required label="Location *" value="{{data.location_name}}" always-float-label=""></paper-input>
                        <paper-input on-keyup="_onEnter" required label="Location mini *" value="{{data.location_mini}}" always-float-label=""></paper-input>
                    </form>
                </iron-form>
            </div>
            <div class="buttons" style="padding:16px;">
                <paper-button id="submitBtn" style="font-size: 14px; border-radius: 0; background-color:  var(--paper-blue-800); color: white; padding: 8px 36px; text-transform: none;" on-tap="_save">Save</paper-button>
                <paper-button id="cancelBtn" style="font-size: 14px; border-radius: 0; background-color: #d9d9d9; color: black; padding: 8px 36px; text-transform: none;" dialog-dismiss>Cancel</paper-button>
            </div>
        </paper-dialog>
        `;
    }

    static get properties() {
        return {
            myData: Object
        }
    }

    static get observers() {
        return [
            '_inputChanged(data.location_name, data.location_mini)'
        ];
    }

    ready() {
        super.ready();
        this.firebaseRef.child('/' + this.myData.code + '/locations').orderByChild('location_name').on('value', function (snapshot) {
            this.firstLoad = false;
            if (snapshot.exists()) this.locations = fbSnapshotToArray(snapshot);
        }.bind(this));
    }

    _inputChanged(location, location_mini) {
        if (location) this.set('data.location_name', capitalizeString(location));
        if (location_mini) this.set('data.location_mini', location_mini.toUpperCase());
    }

    _new() {
        this.$.form.reset();
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _select(e) {
        const data = e.model.item;
        if (!data.location_active) {
            if (confirm("Set this location as your current location?")) {
                const ref = this.firebaseRef.child('/' + this.myData.code + '/locations');
                const current = this.locations.filter(x => { return x.location_active });

                if (current.length > 0) ref.child(current[0].$key).update({ location_active: false });
                ref.child(data.$key).update({ location_active: true });
                this.firebaseRef.child('/accounts/' + this.myData.$key).update({
                    location: data.location_mini,
                    location_code: data.location_code
                });
            }
        }
    }

    _save() {
        if (this.$.form.validate()) {
            this.data.location_code = this._generateCode();
            this.data.location_active = false;
            this.firebaseRef.child("/" + this.myData.code + "/locations").push(this.data).then(function () {
                this.$.dialog.close();
                alert('Location successfully saved!');
            }.bind(this));
        } else {
            alert('Please fill-up all the required fields!');
        }
    }

    _onEnter(e) {
        if (e.keyCode === 13) this._save();
    }

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }

    _generateCode() {
        const uid = new ShortUniqueId();
        return uid.randomUUID(7);
    }
}

window.customElements.define('user-location', UserLocation);