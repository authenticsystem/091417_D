
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge, formatDate } from '../shared-functions.js';
import { itemStyles, itemPlaceholder } from '../shared-styles2.js';
import '@polymer/paper-dialog/paper-dialog.js';

class SearchPatients extends PolymerElement {
    constructor() {
        super();
        this.firstLoad = true;
        this.isLoading = false;
        this.patients = [];
        this.todayDate = formatDate(new Date(), 'yyyy-mm-dd');
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
        
        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">       
                <app-toolbar class="search">
                    <paper-icon-button id="btn-arrow" icon="my-icons:arrow-back" drawer-toggle="" on-tap="_toggleBack"></paper-icon-button>
                    <div style="width:100%">
                        <g-search id="search" placeholder="Lastname, Firstname Middlename..." query="{{search}}"></g-search>
                    </div>
                </app-toolbar>
            </app-header>
        
            <template is="dom-if" if="[[firstLoad]]">
                <div class="ph-item" style="margin-bottom: -100px;">
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
                <iron-list items="[[patients]]" scroll-target="threshold">
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
                            </div>
                        </div>
                    </template>
                </iron-list>
        
                <div class="loading-indicator">
                    <paper-spinner active="[[isLoading]]"></paper-spinner>
                </div>
            </iron-scroll-threshold>
        </app-header-layout>

        <paper-dialog style="width: 476px;" modal id="dialog">
            <h2 style="background: #4285f4; margin: 0; color: #fff; padding: 16px; font-weight: 400; font-size: 16px;">Add to queue</h2>
            <div>
                <paper-input disabled="[[isAddLoading]]" type="date" value="{{todayDate}}" label="Queue date *" always-float-label="">
                    <iron-icon icon="my-icons:event" slot="prefix"></iron-icon>
                </paper-input>
                <div style="margin-left:4px;margin-top:-6px;">
                    <span id="dateText" style="font-size:11px; color:gray; font-weight:50">[[_dateText(todayDate)]]</span>
                </div>
            </div>
            <div class="buttons" style="padding:16px;">
                <paper-button disabled="[[isAddLoading]]" style="font-size: 14px; border-radius: 0; background-color:  var(--paper-blue-800); color: white; padding: 8px 36px; text-transform: none;" on-tap="_save">Save</paper-button>
                <paper-button disabled="[[isAddLoading]]" style="font-size: 14px; border-radius: 0; background-color: #d9d9d9; color: black; padding: 8px 36px; text-transform: none;" dialog-dismiss>Cancel</paper-button>
            </div>
        </paper-dialog>
    `;
    }

    static get properties() {
        return {
            myData: Object,
            myCode: String,
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

    connectedCallback() {
        super.connectedCallback();
        this.$.search.focus();
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

    _select(e) {
        this.selectedPatient = e.model.item;
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _save() {
        var mykey = this.myCode;
        var pickDate = this.todayDate;
        var self = this;

        var queueData = {
            patient_info: {
                firstname: this.selectedPatient.personal.firstname,
                middlename: this.selectedPatient.personal.middlename,
                lastname: this.selectedPatient.personal.lastname,
                birthday: this.selectedPatient.personal.birthday ? this.selectedPatient.personal.birthday : null,
                sex: this.selectedPatient.personal.sex,
                name: this.selectedPatient.personal.name,
                hmo: this.selectedPatient.insurance.primary_insurance
            },
            patient_profile: this.selectedPatient.profile ? this.selectedPatient.profile : null,
            patient_refKey: this.selectedPatient.$key,
            patient_no: this.selectedPatient.no,
            queueLocation: this.myData.location,
            isCancel: false,
            isQueue: true,
            isNext: true,
            queueNo: 1,
            xy: "y"
        }

        this.isAddLoading = true;
        var queueRef = firebase.database().ref("/" + mykey + "/queue/" + queueData.queueLocation + "/" + pickDate);
        queueRef.orderByChild("patient_no").equalTo(queueData.patient_no).limitToLast(1).once("value").then(function (data) {
            if (data.exists()) {
                if (Object.values(data.val())[0].isCancel) {
                    self._locateNextQueue(mykey, queueData, pickDate, self, queueRef);
                } else {
                    self.isAddLoading = false;
                    self.$.dialog.close();
                    alert("Patient already added to queue!");
                    self._toggleBack();
                }
            }
            else {
                self._locateNextQueue(mykey, queueData, pickDate, self, queueRef);
            }
        });
    }

    _locateNextQueue(mykey, queueData, pickDate, self, queueRef) {
        queueRef.once('value').then(function (snapshot) {
            if (snapshot.exists()) {
                queueRef.orderByChild("isNext").equalTo(true).once('value').then(function (hasNext) {
                    if (hasNext.exists()) {
                        queueData.isNext = false;
                        queueData.queueNo = snapshot.numChildren() + 1;
                        queueRef.push(queueData).then(function () {
                            self.isAddLoading = false;
                            self.$.dialog.close();
                            alert("Patient successfully added to queue!");
                            self._toggleBack();
                        });
                    }
                    else {
                        queueData.queueNo = snapshot.numChildren() + 1;
                        queueRef.push(queueData).then(function () {
                            self.isAddLoading = false;
                            self.$.dialog.close();
                            alert("Patient successfully added to queue!");
                            self._toggleBack();
                        });
                    }
                });
            }
            else {
                queueRef.push(queueData).then(function () {
                    self.isAddLoading = false;
                    self.$.dialog.close();
                    alert("Patient successfully added to queue!");
                    self._toggleBack();
                });
            }
        });
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
        this._debounceJob = Debouncer.debounce(this._debounceJob,
            timeOut.after(500), () => {
                firebase.database().ref('/' + this.myCode + '/patients').orderByChild(orderChild).startAt(value).limitToFirst(15).once('value', function (snapshot) {
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

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _patientImg(e) {
        if (e) return e;
        return '../../images/user.png';
    }

    _dateText(date) {
        if (date) return formatDate(date, 'dd-month-yyyy');
        return 'Please pick a date!';
    }

    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }
    _toggleBack() { window.history.back(); }
}

window.customElements.define('search-patients', SearchPatients);
