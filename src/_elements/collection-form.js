
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { fbSnapshotToArray, getAge, generatePushID, toIdString, formatDate } from 'g-element/src/sharedFunctions.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-from-left-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';
import '@polymer/neon-animation/animations/slide-left-animation.js';
import '@silverlinkz/sl-gallery';
import 'time-elements/dist/time-elements.js';
import './collection-datatable.js';

class CollectionForm extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.selectedPage = 0;
        this.collectionData = [];
        // this.dateIssued = formatDate(new Date(), 'yyyy-mm-dd');
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
                        <a href="[[prevRoute]]">
                            <paper-icon-button class="main" icon="my-icons:arrow-back"></paper-icon-button>
                        </a>
                        <div main-title="">New Collection</div>
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
                        <collection-datatable my-data="[[myData]]" my-code="[[myCode]]" patient="[[selectedPatient.personal.name]]" patient-hmo="[[selectedPatient.insurance.primary_insurance]]" data="{{collectionData}}" total="{{collectionTotal}}" remarks="{{collectionRemarks}}" date-issued="{{dateIssued}}" on-page-changed="_transactionPageChanged"></collection-datatable>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div>
                                <div id="saveSuccess" style="color: green; display:none">Collection successfully saved.
                                    <p style="margin-top:-4px">Collection ref.# <b style="color:#1976d2">[[reference]]</b></p>
                                    <a href="[[prevRoute]]">
                                        <paper-button style="margin-top: -56px;" class="primary">Go back!</paper-button>
                                    </a>
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
            myCode: String,
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
            '_showSaved(collectionData.length, dateIssued)'
        ];
    }

    _selectedPageChanged(page) {
        switch (page) {
            case 0:
                this.favlefthide = true;
                if (!this.selectedPatient) this.favrighthide = true;
                else this.favrighthide = false;
                this.$.favright.icon = "my-icons:chevron-right";
                this.$.favright.style.backgroundColor = "#01579B";
                break;
            case 1:
                this.favlefthide = false;
                if (this.collectionData.length > 0 && this.dateIssued) this.favrighthide = false;
                else this.favrighthide = true;
                this.$.favright.icon = "my-icons:check";
                this.$.favright.style.backgroundColor = "green";
                break;
            case 2:
                this._save();
                this.favlefthide = true;
                this.favrighthide = true;
                break;
        }
    }

    _transactionPageChanged(e) {
        if (e.detail == 1) {
            this.favlefthide = true;
            this.favrighthide = true;
        } else {
            this.favlefthide = false;
            if (this.collectionData.length > 0 && this.dateIssued) this.favrighthide = false;
            else this.favrighthide = true;
        }
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
                        this.firebaseRef.child('/' + this.myCode + '/patients').orderByChild('personal/name').startAt(search).limitToFirst(5).once('value', function (snapshot) {
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
            this.firebaseRef.child('/' + this.myCode + '/cases').orderByChild('patientkey').equalTo(patient.$key).limitToLast(1).once('value', function (snapshot) {
                this.visitLoading = false;
                this.favrighthide = false;
                if (snapshot.exists()) this.previousVisits = fbSnapshotToArray(snapshot)[0];
                else this.previousVisits = null;
            }.bind(this));
        }
    }

    _showSaved(e, d) {
        if (e > 0 && d) this.favrighthide = false;
        else this.favrighthide = true;
    }

    async _save() {
        var newCollectionRef, updateAtOnce = {}, num = 0;
        var collection = {
            created: this.dateIssued,
            clinic_location: this.myData.location,
            collection_total: this.collectionTotal,
            patientinfo: {
                name: this.selectedPatient.personal.name,
                profile: this.selectedPatient.profile ? this.selectedPatient.profile : null,
                num: this.selectedPatient.no,
                birthday: this.selectedPatient.personal.birthday,
                gender: this.selectedPatient.personal.sex ? this.selectedPatient.personal.sex : "",
                hmo: this.selectedPatient.insurance.primary_insurance
            },
            remarks: this.collectionRemarks ? this.collectionRemarks : "No Remarks"
        }

        if (this.dateIssued < formatDate(new Date(), 'yyyy-mm-dd')) {
            newCollectionRef = await generatePushID(this.dateIssued, '/' + this.myCode + '/collection');
            collection.timestamp = newCollectionRef.timestamp;
            collection.order = newCollectionRef.timestamp;
        }
        else {
            newCollectionRef = await this.firebaseRef.child("/" + this.myCode + "/collection").push();
            collection.timestamp = firebase.database.ServerValue.TIMESTAMP;
            collection.order = firebase.database.ServerValue.TIMESTAMP;
        }

        const receivablesRef = "/" + this.myCode + "/receivables";
        const numRef = "/" + this.myCode + "/uniqueId/collection";
        const collectionRef = "/" + this.myCode + "/collection/" + newCollectionRef.key;
        const collectionDataRef = "/" + this.myCode + "/collection_data";
        const billingDataRef = "/" + this.myCode + "/billing_data";
        const numSnapshot = await this.firebaseRef.child(numRef).once('value');
        num = (numSnapshot.val() ? numSnapshot.val() : 0) + 1;
        collection.ref = toIdString(num);
        this.reference = collection.ref;

        updateAtOnce[numRef] = num;
        updateAtOnce[collectionRef] = collection;

        const update = await this.firebaseRef.update(updateAtOnce).catch(err => { return "Denied!" });
        if (update === 'Denied!') {
            this.$.saveFailed.style.display = "block";
            this.$.saveLoad.style.display = "none";
            return;
        }

        this.firebaseRef.child(collectionRef).once('value', function (snapshot) {
            const order = snapshot.val().order * -1;
            this.firebaseRef.child(collectionRef).update({ order: order });
        }.bind(this));

        this.collectionData.forEach(element => {
            element.collection_key = newCollectionRef.key;
            element.collection_ref = collection.ref;
            element.patient = this.selectedPatient.personal.name;
            var push = this.firebaseRef.child(collectionDataRef).push(element);

            this.firebaseRef.child(billingDataRef + "/" + element.billing_data_key).update({
                patient_billTo_collected: this.selectedPatient.personal.name + "_" + element.collectFrom + "_true",
                collected: true,
                collection_data_key: push.key,
                collection_key: newCollectionRef.key
            });

            this.firebaseRef.child(receivablesRef + "/" + element.service_collect_from).once('value', function (snapshot) {
                var total = snapshot.val() ? snapshot.val() : 0;
                total -= element.amount;
                this.firebaseRef.child(receivablesRef + "/" + element.service_collect_from).set(total);
            }.bind(this));
        });

        this.$.saveLoad.style.display = 'none';
        this.$.saveSuccess.style.display = 'block';
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
}

window.customElements.define('collection-form', CollectionForm);
