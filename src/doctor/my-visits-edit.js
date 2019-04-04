import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { fbSnapshotToArray, getAge, toIdString } from 'g-element/src/sharedFunctions.js';
import Compressor from 'compressorjs';
import '@polymer/paper-input/paper-textarea.js';
import '@silverlinkz/sl-gallery';
import '../_elements/billing-datatable.js';

class MyVisitsEdit extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.patient = {};
        this.visit = {};
        this.hasPrevBilling = false;
        this.hideRemove = false;
        this.billing = {};
        this.billingData = [];
        this.attachment = [];
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
                        <paper-icon-button class="main" icon="my-icons:arrow-back" on-tap="_toggleBack"></paper-icon-button>
                        <div main-title="">Edit Visit</div>
                        <a href="/visits/detail/v/?ref=[[params.ref]]">
                            <paper-icon-button class="main" icon="my-icons:open-in-new" title="details"></paper-icon-button>
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
        
                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="Chief complaint *" value="{{visit.complain}}"></paper-textarea>
                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="History" value="{{visit.history}}"></paper-textarea>
                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="Laboratory" value="{{visit.laboratory}}"></paper-textarea>

                        <paper-textarea hidden\$="[[!_isEqual(visit.template, 'SOAP')]]" label="Subjective *" value="{{visit.subjective}}"></paper-textarea>
                        <paper-textarea hidden\$="[[!_isEqual(visit.template, 'SOAP')]]" label="Objective" value="{{visit.objective}}"></paper-textarea>
                        <paper-textarea hidden\$="[[!_isEqual(visit.template, 'SOAP')]]" label="Assessment" value="{{visit.assessment}}"></paper-textarea>

                        <div style="font-size:16px; margin-top:16px;">Images</div>
                        <div class="galleryHolder">
                            <sl-gallery hidden="[[!visit.imaging]]" id="gallery">
                                <template is="dom-repeat" items="[[_array(visit.attachment)]]" as="img">
                                    <sl-gallery-image class="image" src="[[img.url]]" small="[[img.url]]"></sl-gallery-image>
                                </template>
                            </sl-gallery>
                            <div hidden="[[!visit.imaging]]" style="border-top:1px solid gray; margin-top: 6px;"></div>
                            <div style="padding:6px;">
                                <input on-change="_changeAttachment" type="file" id="myFile" accept="image/*" multiple="multiple">
                                <output style="font-size:14px;" id="fileList"></output>
                            </div>
                        </div>

                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="Physical Exam" value="{{visit.pe}}"></paper-textarea>
                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="Diagnosis" value="{{visit.diagnosis}}"></paper-textarea>
                        <paper-textarea hidden\$="[[_isEqual(visit.template, 'SOAP')]]" label="Treatment" value="{{visit.treatment}}"></paper-textarea>

                        <paper-textarea label="Plan" value="{{visit.plan}}"></paper-textarea>
                    </div>
                </div>
                
                <billing-datatable show-collected hide-date hide-edit="[[hasPrevBilling]]" hide-remove="[[hideRemove]]" my-data="[[myData]]" patient="[[patient.name]]" patient-hmo="[[patient.hmo]]" data="{{billingData}}" logs="{{billingLogs}}" total="{{billingTotal}}" remarks="{{billingRemarks}}"></billing-datatable>
            </app-header-layout> 

            <paper-fab hidden="[[favhide]]" style="background: green;" class="paper-fab-1" icon="my-icons:check" on-tap="_save"></paper-fab>
        </app-drawer-layout>
        `;
    }

    static get properties() {
        return {
            myData: Object,
            prevRoute: String,
            params: Object,
            cachedBillingTotal: {
                type: Number,
                value: 0
            }
        };
    }

    static get observers() {
        return [
            '_proceedToSave(visit.complain, visit.subjective, hasPrevBilling, billingData.length)'
        ];
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
                this.cachedBillingTotal = snapshot.val().billing_total;
                this.billingTotal = snapshot.val().billing_total;
                this.billingRemarks = snapshot.val().remarks;
                this.hasPrevBilling = true;
                this.billing = snapshot.val();
                this.firebaseRef.child('/' + this.myData.code + '/billing_data').orderByChild('billing_ref').equalTo(this.billing.ref).once('value', function (snapshot) {
                    this.billingData = fbSnapshotToArray(snapshot);
                    this.hideRemove = this.billingData.some(e => e.collected);
                }.bind(this));
            }
        }.bind(this));
    }

    _proceedToSave(e, f, g, l) {
        if (e || f) {
            if (g) {
                if (l > 0) this.favhide = false;
                else this.favhide = true;
            } else this.favhide = false;
        } else this.favhide = true;
    }

    async _save() {
        const receivablesRef = "/" + this.myData.code + "/receivables";
        const casesRef = "/" + this.myData.code + "/cases/" + this.params.ref;
        const numRef = "/" + this.myData.code + "/uniqueId/billing";
        const billingRef = "/" + this.myData.code + "/billing/" + this.params.ref;
        const billingDataRef = "/" + this.myData.code + "/billing_data";
        var num = 0, billing_ref, updateAtOnce = {}, newBilling = {};

        if (!this.visit.imaging) this.visit.imaging = this.attachment.length > 0 ? true : false;
        updateAtOnce[casesRef] = this.visit;

        if (this.billingLogs.length > 0) {
            if (this.hasPrevBilling) {
                this.billing.billing_total = this.billingTotal;
                this.billing.remarks = this.billingRemarks ? this.billingRemarks : "No Remarks";
                billing_ref = this.billing.ref;
                updateAtOnce[billingRef] = this.billing;
            }
            else {
                newBilling = {
                    timestamp: this.visit.timestamp,
                    order: this.visit.order,
                    created: this.visit.created,
                    clinic_location: this.visit.clinic_location,
                    billing_total: this.billingTotal,
                    patientinfo: this.visit.patientinfo,
                    remarks: this.billingRemarks ? this.billingRemarks : "No Remarks"
                }
                newBilling.patientinfo.profile = this.visit.profile ? this.visit.profile : null;

                const snapshot = await this.firebaseRef.child(numRef).once('value');
                num = (snapshot.val() ? snapshot.val() : 0) + 1;
                newBilling.ref = toIdString(num);
                billing_ref = newBilling.ref;
                updateAtOnce[billingRef] = newBilling;
                updateAtOnce[numRef] = num;
            }
        }

        const update = await this.firebaseRef.update(updateAtOnce).catch(err => { return "Denied!" });
        if (update === 'Denied!') return alert('Something went wrong while saving data!');
        if (this.attachment.length > 0) {
            this.attachment.forEach(element => {
                const name = new Date().getTime() + "." + element.name;
                firebase.storage().ref('attachment/' + name).put(element).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                    this.firebaseRef.child(casesRef + "/attachment").push({
                        url: url,
                        type: element.type.split("/")[1],
                        name: name
                    });
                });
            });
        }
        if (this.billingLogs.length > 0) {
            this.billingLogs.forEach(element => {
                if (element.action === "removed") {
                    this.firebaseRef.child(billingDataRef + "/" + element.data.$key).remove();
                    this.firebaseRef.child(receivablesRef + "/" + element.data.service_bill_to).once('value', function (snapshot) {
                        var total = snapshot.val() ? snapshot.val() : 0;
                        total -= element.data.amount;
                        this.firebaseRef.child(receivablesRef + "/" + element.data.service_bill_to).set(total);
                    }.bind(this));
                }
                // else if (element.action === "changed") {
                //     const key = element.data.$key;
                //     delete element.data.$key;
                //     this.firebaseRef.child(billingDataRef + "/" + key).update(element.data);
                // } 
                else if (element.action === "added") {
                    element.data.billing_key = this.params.ref;
                    element.data.billing_ref = billing_ref;
                    element.data.patient = this.patient.name;
                    element.data.collected = false;
                    element.data.patient_billTo_collected = this.patient.name + "_" + element.data.billTo + "_false";
                    this.firebaseRef.child(billingDataRef).push(element.data);
                    this.firebaseRef.child(receivablesRef + "/" + element.data.service_bill_to).once('value', function (snapshot) {
                        var total = snapshot.val() ? snapshot.val() : 0;
                        total += element.data.amount;
                        this.firebaseRef.child(receivablesRef + "/" + element.data.service_bill_to).set(total);
                    }.bind(this));
                }
            });
        }

        alert('Visit successfully updated!');
        window.history.pushState({}, null, '/visits/detail/v/?ref=' + this.params.ref);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _changeAttachment(e) {
        const _$ = this;
        const files = e.target.files;

        this.attachment = [];
        this.$.fileList.innerHTML = '';

        if (files.length > 0) {
            if (files.length > 1) {
                var output = [];
                for (var index = 0, file; file = files[index]; index++) {
                    output.push('<li>', escape(file.name), '</li>');
                    new Compressor(file, {
                        quality: 0.8,
                        width: 440,
                        height: 400,
                        success(result) { _$.attachment.push(result); },
                        error(err) { console.warn(err.message); },
                    });
                }
                this.$.fileList.innerHTML = '<ul>' + output.join('') + '</ul>';
            }
            else {
                new Compressor(files[0], {
                    quality: 0.8,
                    width: 440,
                    height: 400,
                    success(result) { _$.attachment.push(result); },
                    error(err) { console.warn(err.message); },
                });
            }
        }
    }

    _getDate(date) {
        var d = new Date(date);
        return d.toDateString() + ' at ' + d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    _array(e) {
        if (e) return Object.values(e);
        return '';
    }

    _isEqual(e, f) { return e === f; }
    _timeStampToDateTime(ts) { return new Date(ts); }
    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }
    _toggleBack() { history.back(); }
}

window.customElements.define('my-visits-edit', MyVisitsEdit);