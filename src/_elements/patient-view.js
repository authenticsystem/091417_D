import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { getAge, formatDate, fbSnapshotToArray } from 'g-element/src/sharedFunctions.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-from-left-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';
import '@polymer/neon-animation/animations/slide-left-animation.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@silverlinkz/sl-gallery';
import 'time-elements/dist/time-elements.js';

class Patientview extends PolymerElement {
    constructor() {
        super();
        this.selectedPage = 0;
        this.firebaseRef = firebase.database().ref();
        this.visits = [];
    }

    static get template() {
        return html`
         <style include="shared-styles">
            :host {
               display: block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }
            
            .avatar {
                height: 70px;
                width: 70px;
                border-radius: 50%;
                box-sizing: border-box;
                background-color: #DDD;
            }

            .polymer-card {
                max-width: 800px;
                padding: 0;
            }

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
                        <div main-title="">[[header]]</div>
                        <paper-icon-button icon="my-icons:print" on-click="_print" title="Print patient details"></paper-icon-button>
                        <paper-menu-button id="dropdown" horizontal-align="right" close-on-activate>
                            <paper-icon-button icon="my-icons:more-vert" slot="dropdown-trigger" alt="menu" title="More options"></paper-icon-button>
                            <paper-listbox slot="dropdown-content">
                                <paper-item on-tap="_addToQueue">Add to queue</paper-item>
                                <paper-item on-tap="_editPatient">Edit patient</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </app-toolbar>
                    <paper-tabs hidden="[[_isEqual(myData.role, 'Secretary')]]" selected="{{selectedPage}}" scrollable="" fit-container="" noink>
                        <paper-tab>Patient</paper-tab>
                        <paper-tab>Visits</paper-tab>
                    </paper-tabs>
                </app-header>

                <neon-animated-pages selected="[[selectedPage]]" entry-animation="[[entryanimation]]" exit-animation="[[exitanimation]]">
                    <neon-animatable>
                        <div class="polymer-card" id="printMe">
                            <div style="padding:16px; display: flex; margin-bottom: -18px;">
                                <img id="avatar" class="avatar" src="../images/user.png">
                                <div style="margin-left:10px; padding:8px; font-weight:400; color:black">
                                    <span class="truncate">[[patient.personal.name]]</span>
                                    <span class="long-text" style="font-weight:400;display:block">
                                        [[_ageCalc(patient.personal.birthday)]][[_comma(patient.personal.birthday)]]
                                        [[patient.personal.sex]]
                                    </span>
                                    <span class="long-text" style="font-weight:400;display:block">[[_hmo(patient.insurance.primary_insurance)]]</span>
                                </div>
                            </div>

                            <div style="padding:18px">
                                <div style="font-weight:bold; margin-top:16px; padding:5px; background:rgb(236, 235, 235)">Basic Information</div>
                                <table style="margin-bottom:6px; padding:6px;">
                                <tr>
                                    <td>
                                    <span class="long-text">Email address</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.email]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Birth date</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[_formatBday(patient.personal.birthday)]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Marital Status</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.status]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Contact no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.contact]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Street address</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.address]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Occupation</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.occupation]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Employer</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.employer]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Employer phone no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.personal.emp_phone]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Referred to clinic by</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[_refferedBy(patient.personal.referred, patient.personal.doctor, patient.personal.hospital)]]</td>
                                </tr>
                                </table>

                                <div style="font-weight:bold; margin-top:16px; padding:5px; background:rgb(236, 235, 235)">Insurance</div>
                                <table style="padding:6px">
                                <tr>
                                    <td>
                                    <span class="long-text">ID Card no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.card]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Birth date</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.birthday]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Address</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.address]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Home phone no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.home_phone]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Primary Insurance</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.primary_insurance]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Relationship to patient</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.insurance.relationship]]</td>
                                </tr>
                                </table>

                                <div style="font-weight:bold; margin-top:16px; padding:5px; background:rgb(236, 235, 235)">In-case of emergency</div>
                                <table style="padding:6px">
                                <tr>
                                    <td>
                                    <span class="long-text">Name</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.emergency.name]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Relationship to patient</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.emergency.relationship]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Home phone no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.emergency.home_phone]]</td>
                                </tr>
                                <tr>
                                    <td>
                                    <span class="long-text">Work phone no.</span>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td style="color:rgb(37, 37, 37)">[[patient.emergency.work_phone]]</td>
                                </tr>
                                </table>
                            </div>
                        </div>
                    </neon-animatable>

                    <neon-animatable>
                        <div hidden="[[_noVisits(visits.length)]]" class="polymer-card">
                            <div style="padding: 16px; font-size: 16px; text-align: center;">
                                No visits yet.
                            </div>
                        </div>

                        <template is="dom-repeat" items="[[_descending(visits)]]">
                        <a href="/visits/detail/v/?ref=[[item.$key]]">
                            <div class="polymer-card" style="padding: 16px;">
                                <div>
                                    <div style="margin-bottom: 16px;">
                                        <iron-icon icon="my-icons:watch-later"></iron-icon>
                                        <time-ago style="font-size:14px; margin-top:10px;" datetime\$="[[_timeStampToDateTime(item.timestamp)]]">[[_timeStampToDateTime(item.timestamp)]]</time-ago>
                                    </div>
                                    <div hidden="[[!item.complain]]">
                                        <span class="long-text">Chief Complaint</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.complain]]</div>
                                    </div>

                                    <div hidden="[[!item.subjective]]">
                                        <span class="long-text">Subjective</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.subjective]]</div>
                                    </div>

                                    <div hidden="[[!item.objective]]">
                                        <span class="long-text">Objective</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.objective]]</div>
                                    </div>

                                    <div hidden="[[!item.assessment]]">
                                        <span class="long-text">Assessment</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.assessment]]</div>
                                    </div>

                                    <div hidden="[[!item.history]]">
                                        <span class="long-text">History</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.history]]</div>
                                    </div>

                                    <div hidden="[[!item.laboratory]]">
                                        <span class="long-text">Laboratory</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.laboratory]]</div>
                                    </div>

                                    <div hidden="[[!item.imaging]]">
                                        <span class="long-text">Imaging</span>
                                        <div class="galleryHolder">
                                            <sl-gallery id="gallery">
                                                <template is="dom-repeat" items="[[_array(item.attachment)]]" as="img">
                                                    <sl-gallery-image class="image" src="[[img.url]]" small="[[img.url]]"></sl-gallery-image>
                                                </template>
                                            </sl-gallery>
                                        </div>
                                        <br>
                                    </div>

                                    <div hidden="[[!item.pe]]">
                                        <span class="long-text">Physical Exam</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.pe]]</div>
                                    </div>

                                    <div hidden="[[!item.diagnosis]]">
                                        <span class="long-text">Diagnosis</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.diagnosis]]</div>
                                    </div>

                                    <div hidden="[[!item.treatment]]">
                                        <span class="long-text">Treatment</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.treatment]]</div>
                                    </div>

                                    <div hidden="[[!item.plan]]">
                                        <span class="long-text">Plan</span>
                                        <div style="padding-bottom:10px;color:rgb(37, 37, 37)">[[item.plan]]</div>
                                    </div>
                                </div>
                            </div>
                        </a>
                        </template>
                    </neon-animatable>
                </neon-animated-pages>
            </app-header-layout>
        </app-drawer-layout>

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
            params: Object,
            prevRoute: String,
            header: String,
            myData: Object,
            myCode: String
        };
    }

    static get observers() {
        return [
            '_selectedPageChanged(selectedPage)'
        ];
    }

    ready() {
        super.ready();
        this.firebaseRef.child('/' + this.myCode + '/patients/' + this.params.ref).on('value', function (snapshot) {
            if (snapshot.exists()) {
                var patient = snapshot.val();
                if (!this.header) this.header = patient.no;
                if (patient.profile) this.$.avatar.src = patient.profile;
                this.patient = patient;

                this.firebaseRef.child('/' + this.myCode + '/cases').orderByChild('patientkey').equalTo(this.params.ref).limitToFirst(15).once('value', function (visits) {
                    if (visits.exists()) {
                        this.visits = fbSnapshotToArray(visits);
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    _selectedPageChanged(e) {
        if (e == 0) {
            this.entryanimation = "slide-from-right-animation";
            this.exitanimation = "slide-left-animation";
        }
        else {
            this.entryanimation = "slide-from-left-animation";
            this.exitanimation = "slide-right-animation";
        }
    }

    _refferedBy(refer, doctor, hospital) {
        switch (refer) {
            case 'Dr':
                return 'Dr. ' + doctor;
            case 'Insurance plan':
                return refer;
            case 'Hospital':
                return hospital;
        }
    }

    _addToQueue() {
        this.todayDate = formatDate(new Date(), 'yyyy-mm-dd');
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _save() {
        var mykey = this.myCode;
        var pickDate = this.todayDate;
        var self = this;

        var queueData = {
            patient_info: {
                firstname: this.patient.personal.firstname,
                middlename: this.patient.personal.middlename,
                lastname: this.patient.personal.lastname,
                birthday: this.patient.personal.birthday ? this.patient.personal.birthday : null,
                sex: this.patient.personal.sex,
                name: this.patient.personal.name,
                hmo: this.patient.insurance.primary_insurance
            },
            patient_profile: this.patient.profile ? this.patient.profile : null,
            patient_refKey: this.params.ref,
            patient_no: this.patient.no,
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
                        });
                    }
                    else {
                        queueData.queueNo = snapshot.numChildren() + 1;
                        queueRef.push(queueData).then(function () {
                            self.isAddLoading = false;
                            self.$.dialog.close();
                            alert("Patient successfully added to queue!");
                        });
                    }
                });
            }
            else {
                queueRef.push(queueData).then(function () {
                    self.isAddLoading = false;
                    self.$.dialog.close();
                    alert("Patient successfully added to queue!");
                });
            }
        });
    }

    _editPatient() {
        window.history.pushState({}, null, '/patients/edit/p/?ref=' + this.params.ref);
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _print() {
        var content = this.$.printMe.innerHTML;
        var mywindow = window.open('', 'Print', 'height=600,width=800,resizable=no');
        mywindow.document.write(content);
        mywindow.print();
        mywindow.close();
    }

    _formatBday(date) {
        return formatDate(date, 'dd-month-yyyy');
    }

    _array(e) {
        if (e) return Object.values(e);
        return '';
    }

    _descending(data) { return data.reverse(); }
    _timeStampToDateTime(ts) { return new Date(ts); }
    _ageCalc(e) { return getAge(e); }
    _comma(e) { if (e) return ','; }
    _hmo(e) { if (e) return 'HMO:' + e; }
    _isEqual(e, f) { return e === f; }
    _noVisits(e) { return e > 0; }
    _toggleBack() { history.back(); }
    _dateText(date) {
        if (date) return formatDate(date, 'dd-month-yyyy');
        return 'Please pick a date!';
    }
}

window.customElements.define('patient-view', Patientview)