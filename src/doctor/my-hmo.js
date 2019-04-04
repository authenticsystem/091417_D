import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { itemStyles } from '../shared-styles2.js';
import { capitalizeString, fbSnapshotToArray } from 'g-element/src/sharedFunctions.js';
import 'g-element/elements/g-avatar';
import '@polymer/paper-dialog/paper-dialog.js';

class MyHmo extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.firstLoad = true;
        this.hmo = [];
        this.data = { address: "" };
    }

    static get template() {
        return html`
        ${itemStyles}
        <style include="shared-styles">
            a { color: #fff; }
            a:hover { color: #fff; }
        </style>

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-header-layout id="headerLayout" has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar primary="">
                        <a href="/settings">
                            <paper-icon-button class="main" icon="my-icons:arrow-back"></paper-icon-button>
                        </a>
                        <div main-title="">My HMO</div>
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
            
                <template is="dom-if" if="[[_noData(hmo.length, firstLoad)]]">
                    <div id="noRecord">
                        <div class="item center">
                            <div style="margin:auto">
                                No data found.
                            </div>
                        </div>
                    </div>
                </template>
            
                <iron-scroll-threshold id="threshold">
                    <iron-list items="[[hmo]]">
                        <template>
                            <div class="divSeparator">
                                <div class="item center" on-tap="_select">
                                    <g-avatar class="small" label="[[item.name]]"></g-avatar>
                                    <div class="pad">
                                        <div style="font-size:11px" class="long-text">[[item.shortName]]</div>
                                        <div style="font-size: 14px;">[[item.name]]</div>
                                        <div style="font-size: 14px;">[[item.address]]</div>
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
            <h2 style="background: #4285f4; margin: 0; color: #fff; padding: 16px; font-weight: 400; font-size: 16px;">[[dialogHeader]]</h2>
            <div>
                <iron-form id="form">
                    <form>
                        <paper-input on-keyup="_onEnter" required label="Name *" value="{{data.name}}" always-float-label=""></paper-input>   
                        <paper-input on-keyup="_onEnter" required label="Short name *" value="{{data.shortName}}" always-float-label=""></paper-input>
                        <paper-input on-keyup="_onEnter" label="Address (Optional)" value="{{data.address}}" always-float-label=""></paper-input>
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
            '_inputChanged(data.name, data.shortName, data.address)'
        ];
    }

    ready() {
        super.ready();
        this.firebaseRef.child('/' + this.myData.code + '/hmo').orderByChild('name').on('value', function (snapshot) {
            this.firstLoad = false;
            if (snapshot.exists()) this.hmo = fbSnapshotToArray(snapshot);
        }.bind(this));
    }

    _inputChanged(name, mini, address) {
        if (name) this.set('data.name', capitalizeString(name));
        if (mini) this.set('data.shortName', mini.toUpperCase());
        if (address) this.set('data.address', capitalizeString(address));
    }

    _new() {
        this.dialogHeader = "New HMO";
        this.$.form.reset();
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _select(e) {
        this.data = e.model.item;
        this.dialogHeader = "Update " + this.data.shortName;
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _save() {
        if (this.$.form.validate()) {
            const ref = this.firebaseRef.child("/" + this.myData.code + "/hmo");
            const key = this.data.$key;
            if (key) {
                delete this.data.$key;
                ref.child(key).update(this.data).then(function () {
                    this.$.dialog.close();
                    alert('HMO successfully saved!');
                }.bind(this));
            }
            else {
                ref.push(this.data).then(function () {
                    this.$.dialog.close();
                    alert('HMO successfully saved!');
                }.bind(this));
            }
        }
        else {
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
}

window.customElements.define('my-hmo', MyHmo);