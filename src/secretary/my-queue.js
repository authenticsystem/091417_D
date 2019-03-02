
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge, formatDate } from '../shared-functions.js';
import { itemPlaceholder } from '../shared-styles2.js';
import '../_elements/sortable-list.js';

class MyQueue extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
    constructor() {
        super();
        this.firstLoad = true;
        this.isHidden = true;
        this.queue = [];
        this.pickDate = formatDate(new Date(), 'yyyy-mm-dd');
        this.hideFabMini = true;
    }

    static get template() {
        return html`
        ${itemPlaceholder}
        <style include="shared-styles">
            :host { display: block; }

            a { 
                text-decoration: none;
                outline: none;
                -moz-outline-style: none;
            }

            paper-fab.fab-menu-s { 
                position: absolute;
                right: 41px;
                bottom: 146px;
            }

            paper-fab.fab-menu-n { 
                position: absolute;
                right: 41px;
                bottom: 96px;
            }

            .dateInput {
                --paper-input-container-input-color: white;
                --paper-input-container-color: white;
                --paper-input-container-focus-color: white;
                font-size: 10px;
                width: 145px;
            }

            .itemNoRecord {
                @apply --layout-horizontal;
                padding: 15px;
                background-color: white;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
            }

            .list {
                max-width: 736px;
                margin: 16px auto;
                margin-bottom: -16px;
            }

            .list2 {
                max-width: 736px;
                margin: 16px auto;
                margin-bottom: -16px;
            }

            #noRecord {
                width: 736px;
                margin: 16px auto;
            }

            @media (max-width: 1010px) {
                .list {
                    margin: 8px;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: -16px;
                }

                .list2 {
                    margin: 8px;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: -16px;
                }

                #noRecord {
                    width: calc(100% - 16px);
                    margin: 8px;
                    display: flex;
                    flex-direction: column;
                }
            }

            .itemDialog:hover {
                background: rgba(104, 58, 183, 0.26);
                cursor: pointer;
            }

            .sortList {
                position: relative;
                margin-bottom: 30px;
            }

            .item_D {
                @apply --layout-horizontal;
                padding: 15px;
                background-color: white;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
                opacity: 0.4;
                transition: 0.3s;
            }

            .item_N {
                @apply --layout-horizontal;
                padding: 15px;
                background-color: white;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
                opacity: 0.7;
                transition: 0.3s;
            }

            .item_N:hover,
            .item_D:hover {
                opacity: 1;
                box-shadow: 0 6px 20px 0px rgba(0, 0, 0, 0.2);
            }

            .avatar {
                height: 45px;
                width: 45px;
                border: 2px solid white;
                border-radius: 50%;
                box-sizing: border-box;
                background-color: #DDD;
            }

            .pad {
                margin-left: 10px;
                @apply --layout-flex;
                @apply --layout-vertical;
            }

            .item {
                @apply --layout-horizontal;
                padding: 15px;
                background-color: white;
                border-bottom: 1px solid #ddd;
                cursor: pointer;
                box-shadow: 0 6px 20px 0px rgba(0, 0, 0, 0.2);
                transition: 0.3s;
            }

            .cancel {
                transform: rotate(-25deg);
                display: inline-block;
                color: #F44336;
                font-size: 12px;
                padding: 4px;
                border: 2px solid #F44336;
                border-radius: 6px;
                height: 17px;
                margin-top: 10px;
            }

            /* .cancel2 {
                display: none;
                color: #F44336;
                font-size: 12px;
                padding: 4px;
                border: 2px solid #F44336;
                border-radius: 6px;
                height: 17px;
                margin-top: 36px;
                margin-right: -56px;
            } */

            .more-vert {
                color: #673AB7; 
                left: 12px;
                bottom: 10px;
            }
        </style>
        
        <app-route route="{{route}}" pattern="/search/q" active="{{searchQActive}}"></app-route>

        <iron-pages attr-for-selected="name" selected="[[route.path]]" fallback-selection="view404">
           <div name="">
                <app-header-layout fullbleed="" has-scrolling-region="">
                    <app-header fixed="" slot="header">
                        <app-toolbar>
                            <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                            <div main-title="">Queue</div>
                            <div style="margin-top: -16px; margin-right:10px">
                                <paper-input class="dateInput" type="date" value="{{pickDate}}">
                                    <iron-icon icon="my-icons:event" slot="prefix"></iron-icon>
                                </paper-input>
                                <div style="margin-left:4px;margin-top:-16px;">
                                    <span style="font-size:11px; font-weight:400">[[pickText]]</span>
                                </div>
                            </div>
                        </app-toolbar>
                        <paper-tabs hidden="[[!myDoctors]]" attr-for-selected="name" selected="{{selectedDoctor}}" scrollable
                            fit-container noink>
                            <template is="dom-repeat" items="[[myDoctors]]">
                                <paper-tab disabled="[[openSearch]]" name="[[item.code]]~[[item.lastname]]">Dr. [[item.lastname]]</paper-tab>
                            </template>
                        </paper-tabs>
                    </app-header>

                    <template is="dom-if" if="[[firstLoad]]">
                        <div class="ph-item">
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

                    <template is="dom-if" if="[[_noData(queue.length, firstLoad)]]">
                        <div id="noRecord">
                            <div class="itemNoRecord">
                                <div style="margin:auto">
                                    No data found.
                                </div>
                            </div>
                        </div>
                    </template>

                    <iron-scroll-threshold id="threshold">
                        <template id="exceptionTemplate" is="dom-repeat" items="[[exceptionItems]]">
                            <div class="list2">
                                <div class\$="[[_getClassForItem(item.isNext, item.isQueue)]]">
                                    <div style="font-size:16px;" class="long-text">[[item.queueNo]]</div>
                                    <div style="padding:6px"></div>
                                    <div>
                                        <iron-image preload="" fade="" class="avatar" sizing="cover" src\$="[[_patientImg(item.patient_profile)]]"></iron-image>
                                    </div>
                                    <div class="pad">
                                        <div style="font-size:11px" class="long-text">[[item.patient_no]]</div>
                                        <div class="primary-text">[[item.patient_info.name]]</div>
                                        <div class="long-text">
                                            [[_ageCalc(item.patient_info.birthday)]][[_comma(item.patient_info.birthday)]]
                                            [[item.patient_info.sex]]
                                        </div>
                                        <div class="long-text">[[_hmo(item.patient_info.hmo)]]</div>
                                    </div>
                                    <div hidden="[[!item.isCancel]]" class="cancel">Cancelled</div>
                                    <paper-menu-button hidden="[[item.isCancel]]" close-on-activate horizontal-align="right" class="more-vert">
                                        <paper-icon-button icon="my-icons:more-vert" slot="dropdown-trigger"></paper-icon-button>
                                        <paper-listbox slot="dropdown-content">
                                            <a href="/patients/detail/p/?ref=[[item.patient_refKey]]">
                                                <paper-item>View Patient</paper-item>
                                            </a>
                                        </paper-listbox>
                                    </paper-menu-button>
                                </div>
                            </div>
                        </template>

                        <sortable-list class="sortList" sortable=".list" on-select="_selectedIndex" on-drop="_dropIndex">
                            <template id="includedTemplate" is="dom-repeat" items="[[includedItems]]">
                                <div class="list">
                                    <div class\$="[[_getClassForItem(item.isNext, item.isQueue)]]">
                                        <div style="font-size:16px;" class="long-text">[[item.queueNo]]</div>
                                        <div style="padding:6px"></div>
                                        <div>
                                            <iron-image preload="" fade="" class="avatar" sizing="cover" src\$="{{_patientImg(item.patient_profile)}}"></iron-image>
                                        </div>
                                        <div class="pad">
                                            <div style="font-size:11px" class="long-text">[[item.patient_no]]</div>
                                            <div class="primary-text">[[item.patient_info.name]]</div>
                                            <div class="long-text">
                                                [[_ageCalc(item.patient_info.birthday)]][[_comma(item.patient_info.birthday)]] [[item.patient_info.sex]]
                                            </div>
                                            <div class="long-text">[[_hmo(item.patient_info.hmo)]]</div>
                                        </div>
                                        <paper-menu-button close-on-activate horizontal-align="right" class="more-vert">
                                            <paper-icon-button icon="my-icons:more-vert" slot="dropdown-trigger"></paper-icon-button>
                                            <paper-listbox slot="dropdown-content">
                                                <paper-item on-tap="_cancelQueue">Cancel Queue</paper-item>
                                                <a hidden="[[item.isNext]]" href="/patients/edit/p/?ref=[[item.patient_refKey]]&q=[[item.$key]]&d=[[pickDate]]">
                                                    <paper-item>Edit Patient</paper-item>
                                                </a>
                                            </paper-listbox>
                                        </paper-menu-button>
                                    </div>
                                </div>
                            </template>
                        </sortable-list>
                    </iron-scroll-threshold>

                    <paper-fab class="fab-menu" id="mainFab" icon="my-icons:add" on-tap="_toggleFabMini"></paper-fab>
                    <paper-fab hidden="[[hideFabMini]]" class="fab-menu-n" mini="" icon="my-icons:person-add" on-tap="_newPatient" title="new patient"></paper-fab>
                    <paper-fab hidden="[[hideFabMini]]" class="fab-menu-s" mini="" icon="my-icons:search" on-tap="_searchPatient" title="search patient"></paper-fab>
                </app-header-layout>
            </div>
            <div name="/search/q">
                <template is="dom-if" if="[[searchQActive]]" restamp>
                    <search-patients my-data="[[myData]]" my-code="[[doctorCode]]"></search-patients>
                </template>
            </div>
        </iron-pages>
        `;
    }

    static get properties() {
        return {
            myData: Object,
            myDoctors: Array,
            route: Object,
            includedItems: {
                type: Array,
                value: []
            },
            exceptionItems: {
                type: Array,
                value: []
            },
        };
    }

    static get observers() {
        return [
            '_queryChanged(pickDate, selectedDoctor)',
            '_routePageChanged(route.path)',
            '_myDoctorsChanged(myDoctors)'
        ];
    }

    _routePageChanged(page) {
        switch (page) {
            case '/search/q':
                this._showLoader(true);
                import('../_elements/search-patients.js').then(() => this._showLoader(false));
                break;
        }
    }

    _queryChanged(date, doctor) {
        if (doctor) {
            var [code, lastname] = doctor.split('~');
            this.doctorCode = code;
            this.doctorLastname = lastname;
            this.firstLoad = true;
            this.queue = [];
            this.includedItems = [];
            this.exceptionItems = [];
            this._query(date, code);
            if (date) this.pickText = formatDate(date, 'dd-month-yyyy');
            else this.pickText = 'Please pick a date!';
        }
    }

    _myDoctorsChanged(doctors) {
        if (doctors && doctors.length > 0) {
            this.selectedDoctor = doctors[0].code + "~" + doctors[0].lastname;
            this.async(this.notifyResize, 1);
        }
    }

    _query(date, code) {
        this._debounceJob = Debouncer.debounce(this._debounceJob,
            timeOut.after(500), () => {
                this.ref = firebase.database().ref('/' + code + '/queue/' + this.myData.location + '/' + date);
                this.ref.orderByChild('queueNo').startAt(1).on('value', function (snapshot) {
                    if (this.firstLoad) this.firstLoad = false;
                    if (snapshot.exists()) {
                        this.queue = fbSnapshotToArray(snapshot);
                        this.includedItems = this.queue.filter(function (item) { return item.isQueue; });
                        this.exceptionItems = this.queue.filter(function (item) { return !item.isQueue; });
                    }
                }.bind(this));
            });
    }

    _selectedIndex(e) { this.selectedData = this.includedItems[e.detail]; }
    _dropIndex(e) {
        var droppedData = this.includedItems[e.detail];
        if (this.selectedData.queueNo !== droppedData.queueNo) {
            var self = this;
            var ref = firebase.database().ref("/" + this.doctorCode + "/queue/" + this.myData.location + "/" + this.pickDate);
            this.includedItems = [];
            this.exceptionItems = [];
            setTimeout(() => {
                ref.child(self.selectedData.$key).update({
                    queueNo: droppedData.queueNo,
                    isNext: droppedData.isNext,
                    xy: "x"
                }).then(function () {
                    if (droppedData.queueNo > self.selectedData.queueNo) {
                        ref.orderByChild("queueNo").startAt(self.selectedData.queueNo).endAt(droppedData.queueNo).once("value").then(function (snapshot) {
                            if (snapshot.exists()) {
                                snapshot.forEach(element => {
                                    var newQueueNo = element.val().queueNo - 1;
                                    if (element.val().xy === "y" && newQueueNo === self.selectedData.queueNo) {
                                        ref.child(element.key).update({ queueNo: newQueueNo, isNext: self.selectedData.isNext });
                                    } else if (element.val().xy === "y" && newQueueNo !== self.selectedData.queueNo) {
                                        ref.child(element.key).update({ queueNo: newQueueNo });
                                    } else if (element.val().xy === "x") {
                                        ref.child(element.key).update({ xy: 'y' });
                                    }
                                });
                            }
                        });
                    } else {
                        ref.orderByChild("queueNo").startAt(droppedData.queueNo).endAt(self.selectedData.queueNo).once("value").then(function (snapshot) {
                            if (snapshot.exists()) {
                                snapshot.forEach(element => {
                                    var newQueueNo = element.val().queueNo + 1;
                                    if (element.val().xy === "y") {
                                        ref.child(element.key).update({ queueNo: newQueueNo, isNext: false });
                                    } else if (element.val().xy === "x") {
                                        ref.child(element.key).update({ xy: 'y' });
                                    }
                                });
                            }
                        });
                    }
                });
            }, 100);
        }
    }

    _cancelQueue(e) {
        if (confirm("Sure you want to cancel this queue?\nThis action can't be undone.")) {
            var data = this.$.includedTemplate.itemForElement(e.target);
            var startNo = data.queueNo + 1;
            var ref = firebase.database().ref("/" + this.doctorCode + "/queue/" + this.myData.location + "/" + this.pickDate);
            var self = this;

            ref.child(data.$key).update({
                isQueue: false,
                isNext: false,
                isCancel: true,
                xy: "x"
            }).then(function () {
                ref.orderByChild("isNext").equalTo(true).once("value").then(function (hasNext) {
                    if (!hasNext.exists()) {
                        ref.orderByChild("queueNo").startAt(startNo).once("value").then(function (findNext) {
                            if (findNext.exists()) {
                                var done = false;
                                findNext.forEach(element => {
                                    if (done) return;
                                    if (!element.val().isCancel && element.val().isQueue) {
                                        ref.child(element.key).update({ isNext: true });
                                        done = true;
                                        return;
                                    }
                                });
                                if (done) alert("Queue successfully cancelled!");
                            }
                        });
                    }
                });
            });
        }
    }

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _getClassForItem(isNext, isQueue) {
        if (!isNext && !isQueue) return 'item_D';
        else if (!isNext && isQueue) return 'item_N';
        else return 'item';
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

    _toggleFabMini() {
        if (this.hideFabMini) this.$.mainFab.icon = "my-icons:close";
        else this.$.mainFab.icon = "my-icons:add";
        this.hideFabMini = !this.hideFabMini;
    }

    _newPatient() {
        window.history.pushState({}, null, '/patients/new/p?d=' + this.pickDate);
        window.dispatchEvent(new CustomEvent('location-changed'));
        this.hideFabMini = true;
        this.$.mainFab.icon = "my-icons:add";
    }

    _searchPatient() {
        window.history.pushState({}, null, '/queue/search/q');
        window.dispatchEvent(new CustomEvent('location-changed'));
        this.hideFabMini = true;
        this.$.mainFab.icon = "my-icons:add";
    }

    _showLoader(show) {
        this.dispatchEvent(new CustomEvent('showLoader', {
            bubbles: true, composed: true, detail: show
        }));
    }
}

window.customElements.define('my-queue', MyQueue);
