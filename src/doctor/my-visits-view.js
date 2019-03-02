import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { fbSnapshotToArray, getAge } from '../shared-functions.js';
import '@silverlinkz/sl-gallery';
import 'g-element/elements/g-datatable/g-datatable.js';

class MyVisitsView extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.patient = {};
        this.visit = {};
        this.billing = null;
        this.billingData = [];
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display: block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }
            .polymer-card { max-width: 800px; }

            @media (min-width: 480px) {
                .polymer-card {
                    margin: 16px auto;
                }
            }
        </style>

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-header-layout has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar>
                        <!-- <a href="[[prevRoute]]"> -->
                        <paper-icon-button class="main" icon="my-icons:arrow-back" on-tap="_back"></paper-icon-button>
                        <!-- </a> -->
                        <div main-title="">Visit Details</div>
                        <a href="/visits/edit/v/?ref=[[params.ref]]">
                            <paper-icon-button class="main" icon="my-icons:edit" title="edit"></paper-icon-button>
                        </a>
                    </app-toolbar>
                </app-header>
        
                <div class="polymer-card">
                    <div style="display: flex;">
                        <iron-image id="profilePic" preload="" fade="" class="item-avatar" sizing="cover" src="../../images/user.png"></iron-image>
                        <div style="margin-left:10px; font-weight:400; color:black">
                            <span style="font-size:11px;display:block" class="long-text">[[patient.num]]</span>
                            <span class="primary-text">[[patient.name]]</span>
                            <span class="long-text" style="font-weight:400;display:block">
                                [[_ageCalc(patient.birthday)]][[_comma(patient.birthday)]]
                                [[patient.gender]]
                            </span>
                            <span class="long-text" style="font-weight:400;display:block">[[_hmo(patient.hmo)]]</span>
                        </div>
                    </div>
                </div>
        
                <div class="polymer-card">
                    <div>
                        <div style="margin-bottom:16px;">
                            <span class="primary-text" style="color:black; font-weight:400; margin-right:2px;">Date issued</span>
                            <iron-icon icon="my-icons:watch-later"></iron-icon>
                            <span style="font-size:14px; margin-top:10px;">[[_getDate(visit.timestamp)]]</span>
                        </div>
        
                        <div hidden="[[!visit.complain]]">
                            <span class="long-text">Chief Complaint</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.complain]]</div>
                        </div>
        
                        <div hidden="[[!visit.history]]">
                            <span class="long-text">History</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.history]]</div>
                        </div>
        
                        <div hidden="[[!visit.laboratory]]">
                            <span class="long-text">Laboratory</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.laboratory]]</div>
                        </div>
        
                        <div hidden="[[!visit.subjective]]">
                            <span class="long-text">Subjective</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.subjective]]</div>
                        </div>
        
                        <div hidden="[[!visit.objective]]">
                            <span class="long-text">Objective</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.objective]]</div>
                        </div>
        
                        <div hidden="[[!visit.assessment]]">
                            <span class="long-text">Assessment</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.assessment]]</div>
                        </div>
        
                        <div hidden="[[!visit.imaging]]">
                            <span class="long-text">Images</span>
                            <div class="galleryHolder">
                                <sl-gallery id="gallery">
                                    <template is="dom-repeat" items="[[_array(visit.attachment)]]" as="img">
                                        <sl-gallery-image class="image" src="[[img.url]]" small="[[img.url]]"></sl-gallery-image>
                                    </template>
                                </sl-gallery>
                            </div>
                            <br>
                        </div>
        
                        <div hidden="[[!visit.pe]]">
                            <span class="long-text">Physical Exam</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.pe]]</div>
                        </div>
        
                        <div hidden="[[!visit.diagnosis]]">
                            <span class="long-text">Diagnosis</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.diagnosis]]</div>
                        </div>
        
                        <div hidden="[[!visit.treatment]]">
                            <span class="long-text">Treatment</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.treatment]]</div>
                        </div>
        
                        <div hidden="[[!visit.plan]]">
                            <span class="long-text">Plan</span>
                            <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[visit.plan]]</div>
                        </div>
                    </div>
                </div>

                <div hidden="[[!billing]]" class="polymer-card">
                    <div>
                        <div style="font-size: 12px;">Ref. # [[billing.ref]]</div>
                        <div style="font-size: 14px; padding:6px">[[billing.remarks]]</div>
                        <g-datatable data="[[billingData]]">
                            <g-datatable-column header="Services" type="String" property="service"></g-datatable-column>
                            <g-datatable-column header="Bill To" type="String" property="billTo"></g-datatable-column>
                            <g-datatable-column header="Amount" type="Number" property="amount"></g-datatable-column>
                            <g-datatable-column header="Collected" type="Boolean" property="collected"></g-datatable-column>
                        </g-datatable>
                        <div style="padding: 16px;">
                            <div style="float: right;" class="primary">TOTAL: [[billing.billing_total]].00</div>
                        </div>
                    </div>
                </div>
            </app-header-layout>
        </app-drawer-layout>
        `;
    }

    static get properties() {
        return {
            myData: Object,
            prevRoute: String,
            params: Object,
        };
    }

    ready() {
        super.ready();
        this.firebaseRef.child('/' + this.myData.code + '/cases/' + this.params.ref).once('value', function (snapshot) {
            if (snapshot.exists()) {
                var visit = snapshot.val();
                if (visit.profile) this.$.profilePic.src = visit.profile;
                visit.patientinfo.name = visit.patient;
                this.patient = visit.patientinfo;
                this.visit = visit;
            }
        }.bind(this));

        this.firebaseRef.child('/' + this.myData.code + '/billing/' + this.params.ref).once('value', function (snapshot) {
            if (snapshot.exists()) {
                this.billing = snapshot.val();
                this.firebaseRef.child('/' + this.myData.code + '/billing_data').orderByChild('billing_ref').equalTo(this.billing.ref).once('value', function (snapshot) {
                    this.billingData = fbSnapshotToArray(snapshot);
                }.bind(this));
            }
        }.bind(this));
    }

    _getDate(date) {
        var d = new Date(date);
        return d.toDateString() + ' at ' + d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    _array(e) {
        if (e) return Object.values(e);
        return '';
    }

    _timeStampToDateTime(ts) { return new Date(ts); }
    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }
    _back() { history.back(); }
}

window.customElements.define('my-visits-view', MyVisitsView);