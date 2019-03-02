
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge } from '../shared-functions.js';
import { itemStyles, itemPlaceholder } from '../shared-styles2.js';

class MyPatients extends PolymerElement {
    constructor() {
        super();
        this.firstLoad = true;
        this.isLoading = false;
        this.patients = [];
        this.openSearch = false;
    }

    static get template() {
        return html`
        ${itemStyles}
        ${itemPlaceholder}
        <style include="shared-styles">
            .item {
                @apply --layout-horizontal;
                padding: 15px;
            }
        </style>

        <app-route route="{{route}}" pattern="/new/p" active="{{newPActive}}"></app-route>
        <app-route route="{{route}}" pattern="/edit/p/" active="{{editPActive}}"></app-route>
        <app-route route="{{route}}" pattern="/detail/p/" active="{{detailPActive}}"></app-route>
        
        <iron-pages attr-for-selected="name" selected="[[route.path]]" fallback-selection="view404">
            <div name="">
                ${this.MyList}
            </div>
            <div name="/new/p">
                <template is="dom-if" if="[[newPActive]]" restamp>
                    <patient-form prev-route="[[route.prefix]]" params="[[route.__queryParams]]" header="New Patient" my-data="[[myData]]" my-code="[[doctorCode]]"></patient-form>
                </template>
            </div>
            <div name="/edit/p/">
                <template is="dom-if" if="[[editPActive]]" restamp>
                    <patient-form prev-route="[[route.prefix]]" params="[[route.__queryParams]]" header="[[selectedPatient.no]]" my-data="[[myData]]" my-code="[[doctorCode]]"></patient-form>
                </template>
            </div>
            <div name="/detail/p/">
                <template is="dom-if" if="[[detailPActive]]" restamp>
                    <patient-view prev-route="[[route.prefix]]" params="[[route.__queryParams]]" header="[[selectedPatient.no]]" my-data="[[myData]]" my-code="[[doctorCode]]"></patient-view>
                </template>
            </div>
            <div name="view404">
                <div style="padding: 16px;">
                    Oops you hit a 404. <a href="/patients">Head back to patients.</a>
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
                        <div main-title="">Patients</div>
                        <paper-icon-button icon="my-icons:search" on-tap="_toggleSearch" title="Search patients"></paper-icon-button>
                        <paper-icon-button class="main" icon="my-icons:cached" on-tap="_reload" title="Reload patients"></paper-icon-button>
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
                        <div class="ph-row">
                            <div class="ph-col-1"></div>
                            <div class="ph-col-10 empty"></div>
                            <div class="ph-col-8 big"></div>
                            <div class="ph-col-2 empty"></div>
                            <div class="ph-col-6"></div>
                        </div>
                    </div>
                </div>
            </template>
        
            <template is="dom-if" if="[[_noData(patients.length, firstLoad)]]">
                <div id="noRecord">
                    <div class="item">
                        <div style="margin:auto">
                            No data found.
                        </div>
                    </div>
                </div>
            </template>
        
            <iron-scroll-threshold id="threshold" on-lower-threshold="_loadMoreData">
                <iron-list id="list" items="[[patients]]" scroll-target="threshold">
                    <template>
                        <div>
                            <div class="item">
                                <div>
                                    <iron-image preload="" fade="" class="item-avatar" sizing="cover" src\$="[[_patientImg(item.profile)]]"></iron-image>
                                </div>
                                <div class="pad" on-tap="_select">
                                    <div style="font-size:11px" class="long-text">[[item.no]]</div>
                                    <div class="primary-text">[[item.personal.name]]</div>
                                    <div class="long-text">
                                        [[_ageCalc(item.personal.birthday)]][[_comma(item.personal.birthday)]]
                                        [[item.personal.sex]]
                                    </div>
                                    <div class="long-text">[[_hmo(item.insurance.primary_insurance)]]</div>
                                    <div class="long-text">[[item.lastchiefcomplaint]]</div>
                                </div>
        
                                <div class="clinic">[[item.personal.clinic_location]]</div>
                                <paper-icon-button class="pencil" noink="" on-tap="_edit" icon="my-icons:edit" title="Edit"></paper-icon-button>
                            </div>
                        </div>
                    </template>
                </iron-list>
        
                <div class="loading-indicator">
                    <paper-spinner active="[[isLoading]]"></paper-spinner>
                </div>
            </iron-scroll-threshold>
        
            <paper-fab class="fab-menu" icon="my-icons:person-add" on-tap="_new"></paper-fab>
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
            lastNum: {
                type: String,
                value: ''
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
            case '/new/p':
                this._showLoader(true);
                import('../_elements/patient-form.js').then(() => this._showLoader(false));
                break;
            case '/edit/p/':
                this._showLoader(true);
                import('../_elements/patient-form.js').then(() => this._showLoader(false));
                break;
            case '/detail/p/':
                this._showLoader(true);
                import('../_elements/patient-view.js').then(() => this._showLoader(false));
                break;
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
            this.lastNum = "";
            this.doctorCode = code;
            this.doctorLastname = lastname;
            this._query("", "no");
            this.$.threshold.clearTriggers();
        }
    }

    _searchChanged(search) {
        if (search) {
            this.lastNum = "";
            search = search.toUpperCase();
            this._query(search, "personal/name");
        } else {
            this._query("", "no");
        }
    }

    _loadMoreData() {
        if (!this.firstLoad) this.isLoading = true;
        this._query(this.lastNum, "no", function (data) {
            this.isLoading = false;
            if (data.length > 0) {
                var i = 0, length = data.length;
                data.forEach(element => {
                    if (!(this.patients.some(patient => patient['$key'] === element.$key))) this.push('patients', element);
                    i++;
                });
                if (i == length) this.$.threshold.clearTriggers();
            }
        }.bind(this));
    }

    _query(value, orderChild, callback) {
        if (this.doctorCode) {
            this._debounceJob = Debouncer.debounce(this._debounceJob,
                timeOut.after(500), () => {
                    firebase.database().ref('/' + this.doctorCode + '/patients').orderByChild(orderChild).startAt(value).limitToFirst(15).once('value', function (snapshot) {
                        if (this.firstLoad) this.firstLoad = false;
                        if (snapshot.exists()) {
                            var data = fbSnapshotToArray(snapshot);
                            this.lastNum = data[data.length - 1].no;

                            if (typeof callback == 'function') {
                                callback(data);
                            } else {
                                this.patients = data;
                            }
                        }
                    }.bind(this));
                });
        }
    }

    _new() {
        window.history.pushState({}, null, '/patients/new/p');
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _edit(e) {
        this.selectedPatient = e.model.item;
        window.history.pushState({}, null, '/patients/edit/p/?ref=' + this.selectedPatient.$key);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _select(e) {
        this.selectedPatient = e.model.item;
        window.history.pushState({}, null, '/patients/detail/p/?ref=' + this.selectedPatient.$key);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _toggleSearch() {
        this.openSearch = !this.openSearch;
        if (this.openSearch) this.$.search.focus();
        if (!this.openSearch) this.search = null;
    }

    _reload() {
        this.patients = [];
        this.lastNum = "";
        this.firstLoad = true;
        this._query(this.lastNum, "no");
    }

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _patientImg(e) {
        if (e) return e;
        return '../../images/user.png';
    }

    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }
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

window.customElements.define('my-patients', MyPatients);
