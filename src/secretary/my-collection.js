
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge } from '../shared-functions.js';
import { itemStyles, itemPlaceholder } from '../shared-styles2.js';
import 'time-elements/dist/time-elements.js';
import '../_elements/item-card.js';

class MyCollection extends PolymerElement {
    constructor() {
        super();
        this.firstLoad = true;
        this.isLoading = false;
        this.collection = [];
        this.openSearch = false;
        this.firebaseRef = firebase.database().ref();
    }

    static get template() {
        return html`
        ${itemStyles}
        ${itemPlaceholder}
        <style include="shared-styles">
            .item {
                margin-bottom: 6px;
            }
            
            .pencil {
                display: inline-block;
                position: absolute; 
                color: #673AB7; 
                right: 10px;
                top:8px;
            }

            .drop {
                display: inline-block;
                position: absolute; 
                color: #f44336; 
                right: 6px;
                top:3px;
            }

            .clinic {
                position: absolute;
                right: 45px;
                top: 15px;
                font-size: 12px;
            }
        </style>
        
        <app-route route="{{route}}" pattern="/new/c" active="{{newCActive}}"></app-route>
        <app-route route="{{route}}" pattern="/detail/c/" active="{{detailCActive}}"></app-route>
        
        <iron-pages attr-for-selected="name" selected="[[route.path]]" fallback-selection="view404">
            <div name="">
                ${this.MyList}
            </div>
            <div name="/new/c">
                <template is="dom-if" if="[[newCActive]]" restamp>
                    <collection-form prev-route="[[route.prefix]]" my-data="[[myData]]" my-code="[[doctorCode]]"></collection-form>
                </template>
            </div>
            <div name="/detail/c/">
                <template is="dom-if" if="[[detailCActive]]" restamp>
                    <collection-view prev-route="[[route.prefix]]" params="[[route.__queryParams]]" header="[[selectedCollection.ref]]" my-data="[[myData]]" my-code="[[doctorCode]]"></collection-view>
                </template>
            </div>
            <div name="view404">
                <div style="padding: 16px;">
                    Oops you hit a 404. <a href="/collection">Head back to collection.</a>
                </div>
            </div>
        </iron-pages>
    `;
    }

    static get MyList() {
        return html`
        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">
                <div hidden="[[openSearch]]">
                    <app-toolbar>
                        <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                        <div main-title="">Collection</div>
                        <paper-icon-button icon="my-icons:search" on-tap="_toggleSearch" title="Search collection"></paper-icon-button>
                        <paper-icon-button class="main" icon="my-icons:cached" on-tap="_reload" title="Reload collection"></paper-icon-button>
                    </app-toolbar>
                </div>
        
                <div hidden="[[!openSearch]]">
                    <app-toolbar class="search">
                        <paper-icon-button id="btn-arrow" icon="my-icons:arrow-back" drawer-toggle="" on-tap="_toggleSearch"></paper-icon-button>
                        <div style="width:100%">
                            <g-search id="search" placeholder="Lastname, Firstname Middlename..." query="{{search}}"></g-search>
                        </div>
                    </app-toolbar>
                </div>
        
                <paper-tabs hidden="[[!myDoctors]]" attr-for-selected="name" selected="{{selectedDoctor}}" scrollable
                    fit-container noink>
                    <template is="dom-repeat" items="[[myDoctors]]">
                        <paper-tab disabled="[[openSearch]]" name="[[item.code]]~[[item.lastname]]">Dr. [[item.lastname]]</paper-tab>
                    </template>
                </paper-tabs>
            </app-header>
        
            <template is="dom-if" if="[[firstLoad]]">
                <div class="ph-item" style="margin-bottom: -130px;">
                    <div class="ph-col-1">
                        <div class="ph-avatar" style="width: 45px;"></div>
                    </div>
                    <div class="ph-col-8">
                        <div class="ph-row" style="margin-top:6px;">
                            <div class="ph-col-8 big"></div>
                            <div class="ph-col-2 empty"></div>
                            <div class="ph-col-6 big"></div>
                        </div>
                    </div>
                </div>
            </template>
        
            <template is="dom-if" if="[[_noData(collection.length, firstLoad)]]">
                <div id="noRecord">
                    <div class="item center">
                        <div style="margin:auto">
                            No data found.
                        </div>
                    </div>
                </div>
            </template>
        
            <iron-scroll-threshold id="threshold" on-lower-threshold="_loadMoreData">
                <iron-list id="list" items="[[collection]]" scroll-target="threshold">
                    <template>
                        <div>
                            <div class="item">
                                <item-card on-tap="_select" item="[[item]]" my-key="[[doctorCode]]" query-to="collection_data"
                                    child-to="collection_ref"></item-card>
                                <div class="clinic">[[item.clinic_location]]</div>
                                <paper-icon-button class="drop" noink on-tap="_drop" icon="my-icons:close" title="remove"></paper-icon-button>
                            </div>
                        </div>
                    </template>
                </iron-list>
        
                <div class="loading-indicator">
                    <paper-spinner active="[[isLoading]]"></paper-spinner>
                </div>
            </iron-scroll-threshold>
        
            <paper-fab class="fab-menu" icon="my-icons:add" on-tap="_new"></paper-fab>
        </app-header-layout>
        `;
    }

    static get properties() {
        return {
            myData: Object,
            myDoctors: Array,
            route: Object,
            search: {
                type: String,
                value: null,
                observer: '_searchChanged'
            },
            lastOrder: {
                type: String,
                value: null
            }
        };
    }

    static get observers() {
        return [
            '_routePageChanged(route.path)',
            '_myDoctorsChanged(myDoctors)',
            '_selectedDoctorChanged(selectedDoctor)'
        ];
    }

    _routePageChanged(page) {
        switch (page) {
            case '/new/c':
                this._showLoader(true);
                import('../_elements/collection-form.js').then(() => this._showLoader(false));
                break;
            case '/detail/c/':
                this._showLoader(true);
                import('../_elements/collection-view.js').then(() => this._showLoader(false));
                break;
        }
    }

    _searchChanged(search) {
        if (search) {
            search = search.toUpperCase();
            this._query(search, 'patientinfo/name');
        } else {
            this._query(null, "order");
        }
    }

    _myDoctorsChanged(doctors) {
        if (doctors && doctors.length > 0) {
            this.selectedDoctor = doctors[0].code + "~" + doctors[0].lastname;
            this.$.list.dispatchEvent(new CustomEvent("resize", { bubbles: true, composed: true }));
        }
    }

    _selectedDoctorChanged(e) {
        if (e) {
            var [code, lastname] = e.split('~');
            this.lastOrder = null;
            this.doctorCode = code;
            this.doctorLastname = lastname;
            this._query(null, "order");
            this.$.threshold.clearTriggers();
            this.firebaseRef.child('/' + this.doctorCode + '/uniqueId/collection').on('value', function () { this._reload(); }.bind(this));
        }
    }

    _loadMoreData() {
        if (!this.firstLoad) this.isLoading = true;
        this._query(this.lastOrder, "order", function (data) {
            this.isLoading = false;
            if (data.length > 0) {
                var i = 0, length = data.length;
                data.forEach(element => {
                    if (!(this.collection.some(patient => patient['$key'] === element.$key))) this.push('collection', element);
                    i++;
                });
                if (i == length) this.$.threshold.clearTriggers();
            }
        }.bind(this));
    }

    _query(value, orderChild, callback) {
        this._debounceJob = Debouncer.debounce(this._debounceJob,
            timeOut.after(500), () => {
                this.firebaseRef.child('/' + this.doctorCode + '/collection').orderByChild(orderChild).startAt(value).limitToFirst(15).once('value', function (snapshot) {
                    if (this.firstLoad) this.firstLoad = false;
                    if (snapshot.exists()) {
                        var data = fbSnapshotToArray(snapshot);
                        this.lastOrder = data[data.length - 1].order;

                        if (typeof callback == 'function') {
                            callback(data);
                        } else {
                            this.collection = data;
                        }
                    }
                }.bind(this));
            });
    }

    _new() {
        window.history.pushState({}, null, '/collection/new/c');
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _select(e) {
        this.selectedCollection = e.model.item;
        window.history.pushState({}, null, '/collection/detail/c/?ref=' + this.selectedCollection.$key);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _drop(e) {
        const data = e.model.item;
        const index = e.model.index;
        if (confirm("Sure you want to remove collection #" + data.ref + "?\nThis will return billing data to not collected state and the amount will be added back to receivables.\nThere's no undo.")) {
            this.firebaseRef.child("/" + this.doctorCode + "/collection_data").orderByChild("collection_ref").equalTo(data.ref).once('value', function (snapshot) {
                var i = 0, length = snapshot.numChildren();
                snapshot.forEach(element => {
                    this.firebaseRef.child("/" + this.doctorCode + "/collection_data").child(element.key).remove();
                    this.firebaseRef.child("/" + this.doctorCode + "/billing_data/" + element.val().billing_data_key).update({
                        patient_billTo_collected: element.val().patient + "_" + element.val().collectFrom + "_false",
                        collected: false,
                        collection_data_key: null,
                        collection_key: null
                    });
                    this.firebaseRef.child("/" + this.doctorCode + "/receivables/" + element.val().service_collect_from).once('value', function (receivables) {
                        var total = receivables.val() ? receivables.val() : 0;
                        total += element.val().amount;
                        this.firebaseRef.child("/" + this.doctorCode + "/receivables/" + element.val().service_collect_from).set(total);
                    }.bind(this));
                    i++;
                });
                if (i == length) {
                    this.firebaseRef.child("/" + this.doctorCode + "/collection").child(data.$key).remove();
                    this.splice('collection', index, 1);
                    alert('Collection #' + data.ref + " has been successfully removed.");
                }
            }.bind(this));
        }
    }

    _toggleSearch() {
        this.openSearch = !this.openSearch;
        if (this.openSearch) this.$.search.focus();
    }

    _reload() {
        this.collection = [];
        this.lastOrder = null;
        this.firstLoad = true;
        this._query(null, "order");
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

    _showLoader(show) {
        this.dispatchEvent(new CustomEvent('showLoader', {
            bubbles: true, composed: true, detail: show
        }));
    }
}

window.customElements.define('my-collection', MyCollection);
