
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge, formatDate, generatePushID, toIdString } from 'g-element/src/sharedFunctions.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import Compressor from 'compressorjs';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-from-left-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';
import '@polymer/neon-animation/animations/slide-left-animation.js';
import '@polymer/paper-input/paper-textarea.js'
import '@silverlinkz/sl-gallery';
import 'time-elements/dist/time-elements.js';
import 'g-element/elements/g-avatar';
import '../_elements/billing-datatable.js';

class MyVisitsNew extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.selectedPage = 0;
        this.patientsList = [];
        this.attachment = [];
        this.data = {};
        this.visitCreatedDate = formatDate(new Date(), 'yyyy-mm-dd');
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

            .none {
                background: none;
                box-shadow: none;
                padding: 0;
            }

            .textTemp {
                color: rgb(100, 100, 100);
                font-weight: 500;
                font-size: 14px;
            }

            @media (min-width: 480px) {
                .polymer-card {
                    margin: 16px auto;
                }
            }

            .noPatientList{
                padding: 16px;
                text-align: center;
                font-size: 16px;
            }

            .loading-indicator {
                margin-top: 16px;
                text-align: center;
                height: 40px;
            }

            paper-spinner {
                width: 20px;
                height: 20px;
                margin-right: 10px;
            }

            paper-listbox {
                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
            }

            /*  SECTIONS  */
            .section {
                clear: both;
                padding: 0px;
                margin: 0px;
            }

            /*  COLUMN SETUP  */
            .col {
                display: block;
                float:left;
                margin: 1% 0 1% 1.2%;
            }
            .col:first-child { margin-left: 0; }

            /*  GROUPING  */
            .group:before,
            .group:after { content:""; display:table; }
            .group:after { clear:both;}
            .group { zoom:1; /* For IE 6/7 */ }
            /*  GRID OF FOUR  */
            .col-1 {
                width: 100%;
            }
            .col-2 {
                width: 74.7%;
            }
            .col-3 {
                width: 49.4%;
            }
            .col-4 {
                width: 24.1%;
            }

            /*  GO FULL WIDTH BELOW 480 PIXELS */
            @media only screen and (max-width: 480px) {
                .col {  margin: 1% 0 1% 0%; }
                .col-4, .col-3, .col-2, .col-1 { width: 100%; }
            }

            g-avatar { --g-avatar-width: 50px; }
            .crafty {
                font-family: 'Crafty Girls', cursive;
                padding: 1rem 1rem 0;
                text-align: center;
                line-height: 1.3;
                letter-spacing: 4px;
                font-size: 1.125em;
            }

            .temp {
                margin: 0;
                text-align: center;
                cursor: pointer;
                transition: all .2s ease-in-out;
            }
            .temp:hover { opacity: 0.7; }
        </style>
 
        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-header-layout has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar>
                        <paper-icon-button class="main" icon="my-icons:arrow-back" on-tap="_toggleBack"></paper-icon-button>
                        <div main-title="">New Visit</div>
                    </app-toolbar>
                </app-header>

                <neon-animated-pages selected="[[selectedPage]]" entry-animation="[[entryanimation]]" exit-animation="[[exitanimation]]">
                    <neon-animatable>
                        <div class="polymer-card">
                            <div>
                                <paper-input label="Patient *" value="{{search}}" placeholder="Search patient"></paper-input>
                                <div hidden="[[!noData]]" class="noPatientList">No data found.</div>
                                <div hidden="[[!isLoading]]" class="loading-indicator">
                                    <paper-spinner active></paper-spinner>
                                </div>
                                <paper-listbox hidden=[[hideLists]] attr-for-selected="item" selected="{{selectedPatient}}">
                                    <template id="patientItem" is="dom-repeat" items="[[patientsList]]">
                                        <paper-item item="[[item]]">[[item.personal.name]]</paper-item>
                                    </template>
                                </paper-listbox>
                            </div>
                        </div>

                        <div hidden="[[_hasPatient(selectedPatient, isLoading)]]" class="polymer-card">
                            <div style="display: flex;">
                                <iron-image preload="" fade="" class="item-avatar" sizing="cover" src\$="[[_patientImg(selectedPatient.profile)]]"></iron-image>
                                <div style="margin-left:10px; font-weight:400; color:black">
                                    <span style="font-size:11px;display:block" class="long-text">[[selectedPatient.no]]</span>
                                    <span class="primary-text">[[selectedPatient.personal.name]]</span>
                                    <span class="long-text" style="font-weight:400;display:block">
                                        [[_ageCalc(selectedPatient.personal.birthday)]][[_comma(selectedPatient.personal.birthday)]]
                                        [[selectedPatient.personal.sex]]
                                    </span>
                                    <span class="long-text" style="font-weight:400;display:block">[[_hmo(selectedPatient.insurance.primary_insurance)]]</span>
                                </div>
                            </div>
                        </div>

                        <div hidden="[[_hasPatient(selectedPatient, isLoading, visitLoading)]]" class="polymer-card">
                            <div hidden="[[previousVisits]]" class="noPatientList">No previous visit.</div>
                            <div hidden="[[!previousVisits]]">
                                <div style="margin-bottom:16px;">
                                    <span class="primary-text" style="color:black; font-weight:400; margin-right:2px;">Last Visit</span>
                                    <iron-icon icon="my-icons:watch-later"></iron-icon>
                                    <span style="font-size:14px; margin-top:10px;">[[_getDate(previousVisits.timestamp)]]</span>
                                </div>

                                <div hidden="[[!previousVisits.complain]]">
                                    <span class="long-text">Chief Complaint</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.complain]]</div>
                                </div>

                                <div hidden="[[!previousVisits.history]]">
                                    <span class="long-text">History</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.history]]</div>
                                </div>

                                <div hidden="[[!previousVisits.laboratory]]">
                                    <span class="long-text">Laboratory</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.laboratory]]</div>
                                </div>

                                <div hidden="[[!previousVisits.subjective]]">
                                    <span class="long-text">Subjective</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.subjective]]</div>
                                </div>

                                <div hidden="[[!previousVisits.objective]]">
                                    <span class="long-text">Objective</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.objective]]</div>
                                </div>

                                <div hidden="[[!previousVisits.assessment]]">
                                    <span class="long-text">Assessment</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.assessment]]</div>
                                </div>

                                <div hidden="[[!previousVisits.imaging]]">
                                    <span class="long-text">Imaging</span>
                                    <div class="galleryHolder">
                                        <sl-gallery id="gallery">
                                            <template is="dom-repeat" items="[[_array(previousVisits.attachment)]]" as="img">
                                                <sl-gallery-image class="image" src="[[img.url]]" small="[[img.url]]"></sl-gallery-image>
                                            </template>
                                        </sl-gallery>
                                    </div>
                                    <br>
                                </div>

                                <div hidden="[[!previousVisits.pe]]">
                                    <span class="long-text">Physical Exam</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.pe]]</div>
                                </div>

                                <div hidden="[[!previousVisits.diagnosis]]">
                                    <span class="long-text">Diagnosis</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.diagnosis]]</div>
                                </div>

                                <div hidden="[[!previousVisits.treatment]]">
                                    <span class="long-text">Treatment</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.treatment]]</div>
                                </div>

                                <div hidden="[[!previousVisits.plan]]">
                                    <span class="long-text">Plan</span>
                                    <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[previousVisits.plan]]</div>
                                </div>
                            </div>
                        </div>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card none">
                            <div class="textTemp"> Choose a template </div>
                            <div class="section group">
                                <div class="col col-3">
                                    <div class="polymer-card temp" on-tap="_default">
                                        <g-avatar label="D"></g-avatar>
                                        <div class="crafty">Default</div>
                                    </div>
                                </div>
                                <div class="col col-3">
                                    <div class="polymer-card temp" on-tap="_soap">
                                        <g-avatar label="S"></g-avatar>
                                        <div class="crafty">SOAP</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div>
                                <paper-input label="Date issued *" type="date" value="{{visitCreatedDate}}" style="width:150px">
                                    <iron-icon icon="my-icons:event" slot="prefix"></iron-icon>
                                </paper-input>
                                <div style="margin-left:4px;margin-top:-10px;">
                                    <span style="font-size:11px; color:gray; font-weight:50">[[_dateText(visitCreatedDate)]]</span>
                                </div>
                                <paper-textarea hidden="[[soap]]" label="Chief complaint *" value="{{data.complain}}"></paper-textarea>
                                <paper-textarea hidden="[[soap]]" label="History" value="{{data.history}}"></paper-textarea>
                                <paper-textarea hidden="[[soap]]" label="Laboratory" value="{{data.laboratory}}"></paper-textarea>

                                <paper-textarea hidden="[[normal]]" label="Subjective *" value="{{data.subjective}}"></paper-textarea>
                                <paper-textarea hidden="[[normal]]" label="Objective" value="{{data.objective}}"></paper-textarea>
                                <paper-textarea hidden="[[normal]]" label="Assessment" value="{{data.assessment}}"></paper-textarea>

                                <div style="font-size:16px; margin-top:16px;">Upload Images</div>
                                <div style="border:1px solid gray; padding:6px;">
                                    <input on-change="_changeAttachment" type="file" id="myFile" accept="image/*" multiple="multiple">
                                    <output style="font-size:14px;" id="fileList"></output>
                                </div>
                                <paper-textarea hidden="[[soap]]" label="Physical Exam" value="{{data.pe}}"></paper-textarea>
                                <paper-textarea hidden="[[soap]]" label="Diagnosis" value="{{data.diagnosis}}"></paper-textarea>
                                <paper-textarea hidden="[[soap]]" label="Treatment" value="{{data.treatment}}"></paper-textarea>

                                <paper-textarea label="Plan" value="{{data.plan}}"></paper-textarea>
                            </div>
                        </div>
                        <br>
                        <br>
                        <br>
                    </neon-animatable>

                    <neon-animatable>
                        <billing-datatable hide-date my-data="[[myData]]" patient="[[selectedPatient.personal.name]]" patient-hmo="[[selectedPatient.insurance.primary_insurance]]" data="{{billingData}}" total="{{billingTotal}}" remarks="{{billingRemarks}}"></billing-datatable>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div>
                                <div id="saveSuccess" style="color: green; display:none">Visit successfully saved.
                                    <p style="margin-top:-4px">Billing ref.# <b style="color:#1976d2">[[billReference]]</b></p>
                                    <paper-button style="margin-top: -56px;" class="primary" on-tap="_toggleBack">Go back!</paper-button>
                                </div>
                                <div id="saveLoad" style="color: orange;">Saving data...</div>
                                <div id="saveFailed" style="color: red; display:none">Opps! Something went wrong while saving data.</div>
                            </div>
                        </div>
                    </neon-animatable>
                </neon-animated-pages>
            </app-header-layout>

            <paper-fab hidden="[[favlefthide]]" style="background: #1976d2;" id="favleft" class="paper-fab-0" icon="my-icons:chevron-left" on-tap="_prev"></paper-fab>
            <paper-fab hidden="[[favrighthide]]" style="background: #1976d2;" id="favright" class="paper-fab-1" icon="my-icons:chevron-right" on-tap="_next"></paper-fab>
        </app-drawer-layout>
    `;
    }

    static get properties() {
        return {
            myData: Object,
            params: Object,
            search: {
                type: String,
                value: null,
                observer: '_searchChanged'
            }
        };
    }

    static get observers() {
        return [
            '_selectedPageChanged(selectedPage)',
            '_selectedPatientChanged(selectedPatient)',
            '_proceedToBill(data.complain, data.subjective, visitCreatedDate)'
        ];
    }

    ready() {
        super.ready();
        this.search = this.params.n;
    }

    _selectedPageChanged(page) {
        switch (page) {
            case 0:
                this.favlefthide = true;
                if (!this.selectedPatient) this.favrighthide = true;
                else this.favrighthide = false;
                break;
            case 1:
                this.favlefthide = false;
                this.favrighthide = true;
                this.set('data.complain', '');
                this.set('data.subjective', '');
                break;
            case 2:
                if (this.normal && !this.data.complain) this.favrighthide = true;
                if (this.soap && !this.data.subjective) this.favrighthide = true;
                this.$.favright.icon = "my-icons:chevron-right";
                this.$.favright.style.backgroundColor = "#01579B";
                break;
            case 3:
                this.billReference = "----";
                this.data.patient = this.selectedPatient.personal.name;
                this.data.patientkey = this.selectedPatient.$key;
                this.data.profile = this.selectedPatient.profile ? this.selectedPatient.profile : null;
                this.data.patientinfo = {
                    num: this.selectedPatient.no,
                    birthday: this.selectedPatient.personal.birthday,
                    gender: this.selectedPatient.personal.sex ? this.selectedPatient.personal.sex : "",
                    hmo: this.selectedPatient.insurance.primary_insurance
                };
                this.data.template = this.template;
                this.data.clinic_location = this.myData.location;
                this.data.imaging = this.attachment.length > 0 ? true : false;
                this.data.created = this.visitCreatedDate;

                this.$.favright.icon = "my-icons:check";
                this.$.favright.style.backgroundColor = "green";
                break;
            case 4:
                this._save();
                this.favlefthide = true;
                this.favrighthide = true;
                break;
        }
    }

    _proceedToBill(e, f, d) {
        if ((e || f) && d) this.favrighthide = false;
        else this.favrighthide = true;
    }

    _searchChanged(search) {
        if (!this.selectedPatient || (this.selectedPatient.personal.name !== search)) {
            this.favrighthide = true;
            this.selectedPatient = null;
            this.noData = false;
            this.isLoading = false;
            this.hideLists = true;
            if (search) {
                this.isLoading = true;
                search = search.toUpperCase();
                this._debounceJob = Debouncer.debounce(this._debounceJob,
                    timeOut.after(500), () => {
                        this.firebaseRef.child('/' + this.myData.code + '/patients').orderByChild('personal/name').startAt(search).limitToFirst(5).once('value', function (snapshot) {
                            this.isLoading = false;
                            if (snapshot.exists()) {
                                this.patientsList = fbSnapshotToArray(snapshot);
                                this.hideLists = false;
                            } else {
                                this.noData = true;
                            }
                        }.bind(this));
                    });
            } else {
                if (this._debounceJob) this._debounceJob.cancel();
            }
        }
    }

    _selectedPatientChanged(patient) {
        if (patient) {
            this.search = patient.personal.name;
            this.hideLists = true;
            this.visitLoading = true;
            this.firebaseRef.child('/' + this.myData.code + '/cases').orderByChild('patientkey').equalTo(patient.$key).limitToLast(1).once('value', function (snapshot) {
                this.visitLoading = false;
                this.favrighthide = false;
                if (snapshot.exists()) this.previousVisits = fbSnapshotToArray(snapshot)[0];
                else this.previousVisits = null;
            }.bind(this));
        }
    }

    async _save() {
        var newVisitRef, updateAtOnce = {}, num = 0;
        var billing = {
            created: this.visitCreatedDate,
            clinic_location: this.myData.location,
            billing_total: this.billingTotal,
            patientinfo: {
                name: this.selectedPatient.personal.name,
                profile: this.selectedPatient.profile ? this.selectedPatient.profile : null,
                num: this.selectedPatient.no,
                birthday: this.selectedPatient.personal.birthday,
                gender: this.selectedPatient.personal.sex ? this.selectedPatient.personal.sex : "",
                hmo: this.selectedPatient.insurance.primary_insurance
            },
            remarks: this.billingRemarks ? this.billingRemarks : "No Remarks"
        }

        if (this.visitCreatedDate < formatDate(new Date(), 'yyyy-mm-dd')) {
            newVisitRef = await generatePushID(this.visitCreatedDate, this.myData.code);
            this.data.timestamp = newVisitRef.timestamp;
            this.data.order = newVisitRef.timestamp;
        }
        else {
            newVisitRef = await this.firebaseRef.child("/" + this.myData.code + "/cases").push();
            this.data.timestamp = firebase.database.ServerValue.TIMESTAMP;
            this.data.order = firebase.database.ServerValue.TIMESTAMP;
        }

        const receivablesRef = "/" + this.myData.code + "/receivables";
        const casesRef = "/" + this.myData.code + "/cases/" + newVisitRef.key;
        const numRef = "/" + this.myData.code + "/uniqueId/billing";
        const billingRef = "/" + this.myData.code + "/billing/" + newVisitRef.key;
        const billingDataRef = "/" + this.myData.code + "/billing_data";

        const set = await this.firebaseRef.child(casesRef).set(this.data).catch(err => { return "Denied!" });
        if (set === 'Denied!') {
            this.$.saveFailed.style.display = "block";
            this.$.saveLoad.style.display = "none";
            return;
        }

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

        const visitSnapshot = await this.firebaseRef.child(casesRef).once('value');
        const negativeTimestamp = visitSnapshot.val().order * -1;
        updateAtOnce[casesRef + "/order"] = negativeTimestamp;

        if (this.billingData.length > 0) {
            const numSnapshot = await this.firebaseRef.child(numRef).once('value');
            num = (numSnapshot.val() ? numSnapshot.val() : 0) + 1;
            billing.timestamp = visitSnapshot.val().timestamp;
            billing.order = negativeTimestamp;
            billing.ref = toIdString(num);

            this.billReference = billing.ref;

            updateAtOnce[numRef] = num;
            updateAtOnce[billingRef] = billing;
        }

        const update = await this.firebaseRef.update(updateAtOnce).catch(err => { return "Denied!" });
        if (update === 'Denied!') {
            this.$.saveFailed.style.display = "block";
            this.$.saveLoad.style.display = "none";
            return;
        }

        if (this.billingData.length > 0) {
            this.billingData.forEach(element => {
                element.billing_key = newVisitRef.key;
                element.billing_ref = billing.ref;
                element.patient = this.selectedPatient.personal.name;
                element.collected = false;
                element.patient_billTo_collected = this.selectedPatient.personal.name + "_" + element.billTo + "_false";
                this.firebaseRef.child(billingDataRef).push(element);
                this.firebaseRef.child(receivablesRef + "/" + element.service_bill_to).once('value', function (snapshot) {
                    var total = snapshot.val() ? snapshot.val() : 0;
                    total += element.amount;
                    this.firebaseRef.child(receivablesRef + "/" + element.service_bill_to).set(total);
                }.bind(this));
            });
        }

        if (this.params && this.params.q) this._locateNextQueue(newVisitRef.key);
        this._reportsUpdate(this.visitCreatedDate, this.myData.code);

        this.$.saveLoad.style.display = 'none';
        this.$.saveSuccess.style.display = 'block';
        this.dispatchEvent(new CustomEvent('reload', { bubbles: false, composed: false }));
    }

    _reportsUpdate(today, mykey) {
        var mm = today.substring(0, 7);
        var yy = today.substring(0, 4);

        var dayRef = this.firebaseRef.child("/" + mykey + "/reports/daily/" + today + '/visits');
        dayRef.once('value').then(function (snapshot) {
            dayRef.set(snapshot.val() + 1);
        });

        var yearRef = this.firebaseRef.child("/" + mykey + "/reports/yearly/" + yy + '/visits');
        yearRef.once('value').then(function (snapshot) {
            yearRef.set(snapshot.val() + 1);
        });

        var monthRef = this.firebaseRef.child("/" + mykey + "/reports/monthly/" + mm + '/visits');
        monthRef.once('value').then(function (snapshot) {
            monthRef.set(snapshot.val() + 1);
        });
    }

    _locateNextQueue(visitKey) {
        var ref = this.firebaseRef.child("/" + this.myData.code + "/queue/" + this.myData.location + "/" + this.params.d);
        ref.child(this.params.q).update({ isNext: false, isQueue: false, xy: "x", visit_refKey: visitKey }).then(function () {
            ref.orderByChild("isNext").equalTo(true).once("value").then(function (hasNext) {
                if (!hasNext.exists()) {
                    ref.orderByChild("queueNo").startAt(parseInt(this.params.no) + 1).once("value").then(function (findNext) {
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
                        }
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
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

    _prev() {
        this.entryanimation = "slide-from-left-animation";
        this.exitanimation = "slide-right-animation";
        this.selectedPage -= 1;
    }

    _next() {
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.selectedPage += 1;
    }

    _dateText(date) {
        if (date) return formatDate(date, 'dd-month-yyyy');
        return 'Please pick a date!';
    }

    _noData(e, l) {
        if (l) return !l;
        return e == 0;
    }

    _timeStampToDateTime(ts) {
        return new Date(ts);
    }

    _hasPatient(e, l, p) {
        if (l) return true;
        if (p) return true;
        if (!e) return true;
        return false;
    }

    _getDate(date) {
        var d = new Date(date);
        return d.toDateString() + ' at ' + d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    _array(e) {
        if (e) return Object.values(e);
        return '';
    }

    _patientImg(e) {
        if (e) return e;
        return '../../images/user.png';
    }

    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }

    _default() {
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.normal = true;
        this.soap = false;
        this.selectedPage += 1;
        this.template = 'Normal';
    }

    _soap() {
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.normal = false;
        this.soap = true;
        this.selectedPage += 1;
        this.template = 'SOAP';
    }

    _toggleBack() { history.back(); }
}

window.customElements.define('my-visits-new', MyVisitsNew);
