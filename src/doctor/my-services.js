import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { itemStyles } from '../shared-styles2.js';
import { capitalizeString, fbSnapshotToArray } from 'g-element/src/sharedFunctions.js';
import 'g-element/elements/g-avatar';
import '@polymer/paper-dialog/paper-dialog.js';

class MyServices extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.firstLoad = true;
        this.services = [];
        this.data = { address: "" };
    }

    static get template() {
        return html`
        ${itemStyles}
        <style include="shared-styles">
            a { color: #fff; }
            a:hover { color: #fff; }

            /* .loading span {
                font-size: 40px;
                animation-name: blink;
                animation-duration: 1.4s;
                animation-iteration-count: infinite;
                animation-fill-mode: both;
            }

            .loading span:nth-child(2) {  animation-delay: .2s; }
            .loading span:nth-child(3) { animation-delay: .4s; }
            @keyframes blink {
                0% { opacity: .2; }
                20% { opacity: 1; }
                100% { opacity: .2; }
            } */
        </style>

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-header-layout id="headerLayout" has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar primary="">
                        <a href="/settings">
                            <paper-icon-button class="main" icon="my-icons:arrow-back"></paper-icon-button>
                        </a>
                        <div main-title="">My Services</div>
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
            
                <template is="dom-if" if="[[_noData(services.length, firstLoad)]]">
                    <div id="noRecord">
                        <div class="item center">
                            <div style="margin:auto">
                                No data found.
                            </div>
                        </div>
                    </div>
                </template>
            
                <iron-scroll-threshold id="threshold">
                    <iron-list items="[[services]]">
                        <template>
                            <div class="divSeparator">
                                <div class="item center" on-tap="_select">
                                    <g-avatar class="small" label="[[item.service]]"></g-avatar>
                                    <div class="pad">
                                        <div style="font-size:11px" class="long-text">Php [[item.rate]].00</div>
                                        <div>[[item.service]]</div>
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
                        <paper-input on-keyup="_onEnter" required label="Service *" value="{{data.service}}" always-float-label=""></paper-input>
                        <paper-input on-keyup="_onEnter" required label="Rate *" value="{{data.rate}}" allowed-pattern="[\\d]" prevent-invalid-input="" always-float-label=""></paper-input>
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
            '_inputChanged(data.service)'
        ];
    }

    ready() {
        super.ready();
        this.firebaseRef.child('/' + this.myData.code + '/services').orderByChild('service').on('value', function (snapshot) {
            this.firstLoad = false;
            if (snapshot.exists()) this.services = fbSnapshotToArray(snapshot);
        }.bind(this));
    }

    _inputChanged(service) {
        if (service) this.set('data.service', capitalizeString(service));
    }

    _new() {
        this.dialogHeader = "New Service";
        this.$.form.reset();
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _select(e) {
        this.data = e.model.item;
        this.dialogHeader = "Update " + this.data.service;
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _save() {
        if (this.$.form.validate()) {
            const ref = this.firebaseRef.child("/" + this.myData.code + "/services");
            const key = this.data.$key;
            if (key) {
                delete this.data.$key;
                ref.child(key).update(this.data).then(function () {
                    this.$.dialog.close();
                    alert('Service successfully saved!');
                }.bind(this));
            }
            else {
                ref.push(this.data).then(function () {
                    this.$.dialog.close();
                    alert('Service successfully saved!');
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

window.customElements.define('my-services', MyServices);