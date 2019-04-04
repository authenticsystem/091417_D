
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge } from 'g-element/src/sharedFunctions.js';
import { itemStyles, itemPlaceholder } from '../shared-styles2.js';
import 'time-elements/dist/time-elements.js';

class MyVisits extends PolymerElement {
    constructor() {
        super();
        this.firstLoad = true;
        this.isLoading = false;
        this.visits = [];
        this.openSearch = false;
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

            .clinic {
                position: absolute;
                right: 50px;
                top: 15px;
                font-size: 12px;
            }
        </style>

        <app-route route="{{route}}" pattern="/new/v" active="{{newVActive}}"></app-route>
        <app-route route="{{route}}" pattern="/edit/v/" active="{{editVActive}}"></app-route>
        <app-route route="{{route}}" pattern="/detail/v/" active="{{detailVActive}}"></app-route>
 
        <iron-pages attr-for-selected="name" selected="[[route.path]]" fallback-selection="view404">
            <div name="">
                ${this.MyList}
            </div>
            <div name="/new/v">
                <template is="dom-if" if="[[newVActive]]" restamp>
                    <my-visits-new prev-route="[[route.prefix]]" params="[[route.__queryParams]]" my-data="[[myData]]" on-reload="_reload"></my-visits-new>
                </template>
            </div>
            <div name="/edit/v/">
                <template is="dom-if" if="[[editVActive]]" restamp>
                    <my-visits-edit prev-route="[[route.prefix]]" params="[[route.__queryParams]]" my-data="[[myData]]"></my-visits-edit>
                </template>
            </div>
            <div name="/detail/v/">
                <template is="dom-if" if="[[detailVActive]]" restamp>
                    <my-visits-view prev-route="[[route.prefix]]" params="[[route.__queryParams]]" my-data="[[myData]]"></my-visits-view>
                </template>
            </div>
            <div name="view404">
                <div style="padding: 16px;">
                    Oops you hit a 404. <a href="/visits">Head back to visits.</a>
                </div>
            </div>
        </iron-pages>
    `;
    }

    static get MyList() {
        return html`
        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header>
                <div hidden="[[openSearch]]">
                    <app-toolbar>
                        <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                        <div main-title="">Visits</div>
                        <paper-icon-button icon="my-icons:search" on-tap="_toggleSearch" title="Search visits"></paper-icon-button>
                        <paper-icon-button class="main" icon="my-icons:cached" on-tap="_reload" title="Reload visits"></paper-icon-button>
                    </app-toolbar>
                </div>
        
                <div hidden="[[!openSearch]]">
                    <app-toolbar class="search">
                        <paper-icon-button id="btn-arrow" icon="my-icons:arrow-back" drawer-toggle="" on-tap="_toggleSearch"></paper-icon-button>
                        <div style="width:100%">
                            <g-search-bar id="search" placeholder="Lastname, Firstname Middlename..." query="{{search}}"></g-search-bar>
                        </div>
                    </app-toolbar>
                </div>
            </app-header>
        
            <template is="dom-if" if="[[firstLoad]]">
                <div class="ph-item" style="margin-bottom: -200px;">
                    <div class="ph-col-1">
                        <div class="ph-avatar" style="width: 45px;"></div>
                    </div>
                    <div class="ph-col-8">
                        <div class="ph-row">
                            <div class="ph-col-1"></div>
                            <div class="ph-col-10 empty"></div>
                            <div class="ph-col-8 big"></div>
                            <div class="ph-col-2 empty"></div>
                            <div class="ph-col-6"></div>
                            <div class="ph-col-4 empty"></div>
                            <div class="ph-col-12 empty"></div>
                            <div class="ph-col-2"></div>
                            <div class="ph-col-10 empty"></div>
                            <div class="ph-col-12"></div>
                            <div class="ph-col-10"></div>
                        </div>
                    </div>
                </div>
            </template>
        
            <template is="dom-if" if="[[_noData(visits.length, firstLoad)]]">
                <div id="noRecord">
                    <div class="item center">
                        <div style="margin:auto">
                            No data found.
                        </div>
                    </div>
                </div>
            </template>
        
            <iron-scroll-threshold id="threshold" on-lower-threshold="_loadMoreData">
                <iron-list items="[[visits]]" scroll-target="threshold">
                    <template>
                        <div>
                            <div class="item">
                                <div class="pad" on-tap="_select">
                                    <div style="padding: 8px; margin-top: 6px; color:gray;">
                                        <iron-icon icon="my-icons:watch-later"></iron-icon>
                                        <time-ago style="font-size:14px; margin-top:10px;" datetime\$="[[_timeStampToDateTime(item.timestamp)]]">[[_timeStampToDateTime(item.timestamp)]]</time-ago>
                                    </div>
                                    <div style="padding: 6px; display:flex">
                                        <div>
                                            <iron-image preload="" fade="" class="item-avatar" sizing="cover" src\$="[[_patientImg(item.profile)]]"></iron-image>
                                        </div>
                                        <div style="margin-left:10px;">
                                            <div style="font-size:11px" class="long-text">[[item.patientinfo.num]]</div>
                                            <div class="primary-text">[[item.patient]]</div>
                                            <div class="long-text">
                                                [[_ageCalc(item.patientinfo.birthday)]][[_comma(item.patientinfo.birthday)]]
                                                [[item.patientinfo.gender]]
                                            </div>
                                            <div class="long-text">[[_hmo(item.patientinfo.hmo)]]</div>
        
                                            <div style="margin-top:16px;" hidden\$="[[!_isEqual(item.template, 'Normal')]]">
                                                <span class="long-text">Chief Complaint</span>
                                                <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.complain]]</div>
                                            </div>
        
                                            <div style="margin-top:16px;" hidden\$="[[!_isEqual(item.template, 'SOAP')]]">
                                                <span class="long-text">Subjective</span>
                                                <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.subjective]]</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
        
                                <div class="clinic">[[item.clinic_location]]</div>
                                <paper-icon-button class="pencil" noink="" on-tap="_edit" icon="my-icons:edit" title="edit"></paper-icon-button>
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
            '_routePageChanged(route.path)'
        ];
    }

    _routePageChanged(page) {
        switch (page) {
            case '/new/v':
                this._showLoader(true);
                import('./my-visits-new.js').then(() => this._showLoader(false));
                break;
            case '/edit/v/':
                this._showLoader(true);
                import('./my-visits-edit.js').then(() => this._showLoader(false));
                break;
            case '/detail/v/':
                this._showLoader(true);
                import('./my-visits-view.js').then(() => this._showLoader(false));
                break;
        }
    }

    _searchChanged(search) {
        if (search) {
            search = search.toUpperCase();
            this._query(search, "patient");
        } else {
            this._query(null, "order");
        }
    }

    _loadMoreData() {
        if (!this.firstLoad) this.isLoading = true;
        this._query(this.lastOrder, "order", function (data) {
            this.isLoading = false;
            if (data.length > 0) {
                var i = 0, length = data.length;
                data.forEach(element => {
                    if (!(this.visits.some(patient => patient['$key'] === element.$key))) this.push('visits', element);
                    i++;
                });
                if (i == length) this.$.threshold.clearTriggers();
            }
        }.bind(this));
    }

    _query(value, orderChild, callback) {
        this._debounceJob = Debouncer.debounce(this._debounceJob,
            timeOut.after(500), () => {
                firebase.database().ref('/' + this.myData.code + '/cases').orderByChild(orderChild).startAt(value).limitToFirst(15).once('value', function (snapshot) {
                    if (this.firstLoad) this.firstLoad = false;
                    if (snapshot.exists()) {
                        var data = fbSnapshotToArray(snapshot);
                        this.lastOrder = data[data.length - 1].order;

                        if (typeof callback == 'function') {
                            callback(data);
                        } else {
                            this.visits = data;
                        }
                    }
                }.bind(this));
            });
    }

    _new() {
        window.history.pushState({}, null, '/visits/new/v');
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _edit(e) {
        this.selectedVisit = e.model.item;
        window.history.pushState({}, null, '/visits/edit/v/?ref=' + this.selectedVisit.$key);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _select(e) {
        this.selectedVisit = e.model.item;
        window.history.pushState({}, null, '/visits/detail/v/?ref=' + this.selectedVisit.$key);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _toggleSearch() {
        this.openSearch = !this.openSearch;
        if (this.openSearch) this.$.search.focus();
    }

    _reload() {
        this.visits = [];
        this.lastOrder = null;
        this.firstLoad = true;
        this._query(null, "order");
    }

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _timeStampToDateTime(ts) {
        return new Date(ts);
    }

    _isEqual(e, f) {
        return e === f;
    }

    _patientImg(e) {
        if (e) return e;
        return '../../images/user.png';
    }

    _ageCalc(e) {
        return getAge(e);
    }

    _comma(e) {
        if (e) return ',';
    }

    _hmo(e) {
        if (e) return 'HMO:' + e;
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

window.customElements.define('my-visits', MyVisits);
