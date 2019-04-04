import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { formatDate, calculateAge, toIdString } from 'g-element/src/sharedFunctions.js';
import Compressor from 'compressorjs';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/slide-from-right-animation.js';
import '@polymer/neon-animation/animations/slide-from-left-animation.js';
import '@polymer/neon-animation/animations/slide-right-animation.js';
import '@polymer/neon-animation/animations/slide-left-animation.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import 'g-element/elements/g-wizard-steps.js';

class PatientForm extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
        this.entryanimation = "slide-from-right-animation";
        this.exitanimation = "slide-left-animation";
        this.patient = {
            personal: {},
            insurance: {},
            emergency: {}
        };
        this.selectedPage = 0;
        this.favlefthide = true;
        this.uploadText = "Upload profile picture";
        this.patientCreatedDate = formatDate(new Date(), 'yyyy-mm-dd');
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
               display: block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }

            @media (min-width: 640px) {
                #info {
                    display: flex;
                }
            }

            .mnu {
                height: calc(100vh - 60px);
                padding: 16px;
            }
        </style>

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]" align="right">
                <div class="mnu" role="listbox">
                    <g-wizard-steps style="margin-top: 16px;" steps="[&quot;Profile Picture&quot;,&quot;Basic Information&quot;,&quot;Insurance&quot;,&quot;In-case of Emergency&quot;,&quot;Finalize&quot;,&quot;Completed&quot;]" vertical="" step="[[selectedStep]]"></g-wizard-steps>
                </div>
            </app-drawer>

            <app-header-layout has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar>
                        <paper-icon-button class="main" icon="my-icons:arrow-back" on-tap="_toggleBack"></paper-icon-button>
                        <div main-title="">[[header]]</div>
                    </app-toolbar>
                </app-header>

                <neon-animated-pages selected="[[selectedPage]]" entry-animation="[[entryanimation]]" exit-animation="[[exitanimation]]">
                    <neon-animatable>
                        <div class="polymer-card">
                            <div class="polymer-card-header">
                                <span>1. Profile Picture</span>
                            </div>

                            <div style="text-align:center">
                                <img id="profilePic" style="width:200px; height:200px; border-radius:50%;" src="../images/user.png">
                                <br>
                                <div class="upload-btn-wrapper">
                                    <button class="btn">[[uploadText]]</button>
                                    <input on-change="_changepic" id="myfile" type="file" name="myfile" accept="image/*">
                                </div>
                                <br>
                            </div>
                        </div>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div class="polymer-card-header">
                                <span>2. Basic Information</span>
                            </div>

                            <div style="margin-top: -20px;">
                                <div id="info">
                                    <paper-input value="{{patient.personal.firstname}}" label="Firstname *" style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.personal.middlename}}" label="Middlename *" style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.personal.lastname}}" label="Lastname *" style="width:100%"></paper-input>
                                </div>
                                <paper-input id="email" value="{{patient.personal.email}}" label="E-mail Address"></paper-input>
                                <div id="info">
                                    <paper-input auto-validate placeholder="mm/dd/yyyy" pattern="^(0[1-9]|1[0-2])[\\/\\-](0[1-9]|1\\d|2\\d|3[01])[\\/\\-]([0-9]{4})\$" error-message="Invalid date format!" value="{{patient.personal.birthday}}" label="Birth date" style="width:100%;margin-right:10px"></paper-input>
                                    <paper-input value="{{_ageCalc(patient.personal.birthday)}}" label="Age" style="width:100%;"></paper-input>
                                </div>
                                <div id="info">
                                    <paper-dropdown-menu label="Marital Status" style="width:100%; margin-right:10px">
                                        <paper-listbox slot="dropdown-content" style="cursor:pointer" attr-for-selected="name" selected="{{patient.personal.status}}" class="dropdown-content">
                                            <paper-item id="item" name="Single">Single</paper-item>
                                            <paper-item id="item" name="Married">Married</paper-item>
                                            <paper-item id="item" name="Divorced">Divorced</paper-item>
                                            <paper-item id="item" name="Separated">Separated</paper-item>
                                            <paper-item id="item" name="Widowed">Widowed</paper-item>
                                        </paper-listbox>
                                    </paper-dropdown-menu>
                                    <paper-dropdown-menu label="Gender" style="width:100%; margin-right:10px">
                                        <paper-listbox slot="dropdown-content" style="cursor:pointer" attr-for-selected="name" selected="{{patient.personal.sex}}" class="dropdown-content">
                                            <paper-item id="item" name="Male">Male</paper-item>
                                            <paper-item id="item" name="Female">Female</paper-item>
                                        </paper-listbox>
                                    </paper-dropdown-menu>
                                    <paper-input type="number" value="{{patient.personal.contact}}" label="Contact Number" style="width:100%;"></paper-input>
                                </div>
                                <paper-input value="{{patient.personal.address}}" label="Street Address"></paper-input>
                                <paper-input value="{{patient.personal.occupation}}" label="Occupation"></paper-input>
                                <div id="info">
                                    <paper-input value="{{patient.personal.employer}}" label="Employer" style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.personal.emp_phone}}" type="number" label="Employer Phone no." style="width:100%"></paper-input>
                                </div>
                                <br>
                                <span>Referred to clinic by (choose one)</span>
                                <div id="info">
                                    <paper-radio-group style="font-size:14px;" selected="{{patient.personal.referred}}">
                                        <paper-radio-button name="Dr">Dr</paper-radio-button>
                                        <paper-radio-button name="Insurance plan">Insurance plan</paper-radio-button>
                                        <paper-radio-button name="Hospital">Hospital</paper-radio-button>
                                    </paper-radio-group>
                                </div>
                                <paper-input style="margin-top:-15px;" hidden\$="[[!_isEqual(patient.personal.referred, 'Dr')]]" value="{{patient.personal.doctor}}" label="Dr."></paper-input>
                                <paper-input style="margin-top:-15px;" hidden\$="[[!_isEqual(patient.personal.referred, 'Hospital')]]" value="{{patient.personal.hospital}}" label="Hospital name"></paper-input>
                            </div>
                        </div>
                        <br>
                        <br>
                        <br>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div class="polymer-card-header">
                            <span>3. Insurance</span>
                            </div>

                            <div style="margin-top: -20px;">
                                <div id="info">
                                    <paper-input value="{{patient.insurance.card}}" label="ID Card Number" style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.insurance.birthday}}" placeholder="mm/dd/yyyy" pattern="^(0[1-9]|1[0-2])[\\/\\-](0[1-9]|1\\d|2\\d|3[01])[\\/\\-]([0-9]{4})\$" error-message="Invalid date format!" label="Birth date" style="width:100%;"></paper-input>
                                </div>
                                <paper-input value="{{patient.insurance.address}}" label="Address (If different)"></paper-input>
                                <paper-input value="{{patient.insurance.home_phone}}" type="number" label="Home phone no."></paper-input>
                                <paper-input value="{{patient.insurance.primary_insurance}}" label="Please indicate primary insurance"></paper-input>
                                <paper-input value="{{patient.insurance.relationship}}" label="Relationship to patient"></paper-input>
                            </div>
                        </div>
                        <br>
                        <br>
                        <br>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div class="polymer-card-header">
                                <span>4. In-case of emergency</span>
                            </div>

                            <div style="margin-top: -20px;">
                                <div id="info">
                                    <paper-input value="{{patient.emergency.name}}" label="Name of local friend or relative" style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.emergency.relationship}}" label="Relationship to patient" style="width:100%;"></paper-input>
                                </div>
                                <div id="info">
                                    <paper-input value="{{patient.emergency.home_phone}}" type="number" label="Home phone no." style="width:100%; margin-right:10px"></paper-input>
                                    <paper-input value="{{patient.emergency.work_phone}}" type="number" label="Work phone no" style="width:100%;"></paper-input>
                                </div>
                            </div>
                        </div>
                        <br>
                        <br>
                        <br>
                    </neon-animatable>

                    <neon-animatable>
                        <div id="createdDate" style="margin-right:10px">
                            <div style="float:right; padding:16px; margin-top:-34px;">
                                <paper-input type="date" value="{{patientCreatedDate}}" style="width:150px">
                                    <iron-icon icon="my-icons:event" slot="prefix"></iron-icon>
                                </paper-input>
                                <div style="margin-left:4px;margin-top:-10px;">
                                    <span id="dateText" style="font-size:11px; color:gray; font-weight:50">[[_dateText(patientCreatedDate)]]</span>
                                </div>
                            </div>
                        </div>

                        <div id="finalize" class="polymer-card">
                            <div class="polymer-card-header">
                                <span>5. Finalize</span>
                            </div>

                            <div style="margin-top: -20px;">
                                <img id="p_profile" src="../images/user.png" class="item-avatar">
                                <table style="margin-bottom:6px;">
                                    <tr>
                                        <td>
                                            <span class="long-text">Firstname</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.personal.firstname]]</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="long-text">Middlename</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.personal.middlename]]</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="long-text">Lastname</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.personal.lastname]]</td>
                                    </tr>
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
                                        <td style="color:rgb(37, 37, 37)">[[patient.personal.birthday]]</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="long-text">Age</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[age]]</td>
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
                                            <span class="long-text">Gender</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.personal.sex]]</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="long-text">Contact no</span>
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
                                            <span class="long-text">Employer phone no</span>
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

                                <div style="font-weight:bold; padding:5px; background:rgb(236, 235, 235)">Insurance</div>
                                <table style="padding:6px">
                                    <tr>
                                        <td>
                                            <span class="long-text">ID Card no</span>
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
                                            <span class="long-text">Home phone no</span>
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

                                <div style="font-weight:bold; padding:5px; background:rgb(236, 235, 235)">In-case of emergency</div>
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
                                            <span class="long-text">Home phone no</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.emergency.home_phone]]</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span class="long-text">Work phone no</span>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td style="color:rgb(37, 37, 37)">[[patient.emergency.work_phone]]</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <br><br><br>
                    </neon-animatable>

                    <neon-animatable>
                        <div class="polymer-card">
                            <div class="polymer-card-header">
                                <span>6. Completed</span>
                            </div>

                            <div style="margin-top: -20px;">
                                <div id="saveSuccess" style="color: green; display: none;">
                                    Patient successfully saved.
                                    <p style="margin-top:-4px">Patient no: <b style="color:#1976d2">[[patient.no]]</b></p>
                                    <paper-button style="margin-top: -56px;" class="primary" on-tap="_toggleBack">Go back!</paper-button>
                                </div>
                                <div id="saveLoad" style="color: orange;">Saving patient's data...</div>
                                <div id="saveFailed" style="color: red; display: none;">Opps! Something went wrong while saving patient.</div>
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
            params: Object,
            prevRoute: String,
            header: String,
            myData: Object,
            myCode: String
        };
    }

    static get observers() {
        return [
            '_selectedPageChanged(selectedPage)',
            '_nameChanged(patient.personal.firstname, patient.personal.middlename, patient.personal.lastname)'
        ];
    }

    ready() {
        super.ready();
        if (this.params && !this.params.ref) this.$.finalize.style.marginTop = "62px";
        if (this.params && this.params.ref) {
            this.firebaseRef.child('/' + this.myCode + '/patients/' + this.params.ref).on('value', function (snapshot) {
                if (snapshot.exists()) {
                    var patient = snapshot.val();
                    if (!this.header) this.header = patient.no;
                    if (patient.profile) {
                        this.prevProfile = patient.profile;
                        this.uploadText = "Change profile picture";
                        this.$.profilePic.src = patient.profile;
                        this.$.p_profile.src = patient.profile;
                    }
                    if (patient.personal.birthday) patient.personal.birthday = formatDate(patient.personal.birthday, 'mm/dd/yyyy');
                    if (patient.insurance.birthday) patient.personal.birthday = formatDate(patient.insurance.birthday, 'mm/dd/yyyy');
                    this.patientCreatedDate = formatDate(patient.created, 'yyyy-mm-dd');
                    this.$.createdDate.style.display = "none";
                    this.patient = patient;
                }
            }.bind(this));
        }
    }

    _selectedPageChanged(page) {
        switch (page) {
            case 0:
                this.favlefthide = true;
                this.favrighthide = false;
                break;
            case 1:
                this.favlefthide = false;
                if (!this.patient.personal.firstname && !this.patient.personal.lastname) this.favrighthide = true;
                break;
            case 3:
                this.$.favright.icon = "my-icons:chevron-right";
                this.$.favright.style.backgroundColor = "#01579B";
                break;
            case 4:
                if (!this.patientCreatedDate) this.favrighthide = true;
                this.$.favright.icon = "my-icons:check";
                this.$.favright.style.backgroundColor = "green";
                break;
            case 5:
                this._save();
                this.favlefthide = true;
                this.favrighthide = true;
                break;
        }

        this.selectedStep = page + 1;
    }

    _save() {
        if (this.patient.personal.birthday) this.patient.personal.birthday = formatDate(this.patient.personal.birthday, 'yyyy-mm-dd');
        if (this.patient.insurance.birthday) this.patient.insurance.birthday = formatDate(this.patient.insurance.birthday, 'yyyy-mm-dd');
        this.patient.personal.clinic_location = this.myData.location;

        if (this.params && this.params.ref) {
            this.firebaseRef.child("/" + this.myCode + "/patients/" + this.params.ref).update(this.patient, function (error) {
                if (error) {
                    this.$.saveFailed.style.display = "block";
                    this.$.saveLoad.style.display = "none";
                } else {
                    this._uploadProfile(this.prevProfile, this.profile, this.params.ref);
                    this.$.saveSuccess.style.display = "block";
                    this.$.saveLoad.style.display = "none";
                }
            }.bind(this));
        } else {
            this.firebaseRef.child("/" + this.myCode + "/uniqueId/patients").once('value', function (snapshot) {
                const num = (snapshot.val() ? snapshot.val() : 0) + 1;
                const patientRefKey = this.firebaseRef.child("/" + this.myCode + "/patients").push();
                this.set('patient.no', toIdString(num));
                this.set('patient.created', this.patientCreatedDate);

                var updateAtOnce = {};
                updateAtOnce["/" + this.myCode + "/patients/" + patientRefKey.key] = this.patient;
                updateAtOnce["/" + this.myCode + "/uniqueId/patients"] = num;

                this.firebaseRef.update(updateAtOnce, function (error) {
                    if (error) {
                        this.$.saveFailed.style.display = "block";
                        this.$.saveLoad.style.display = "none";
                    } else {
                        this._reportsUpdate(this.patientCreatedDate, this.myCode);
                        this._uploadProfile(this.prevProfile, this.profile, patientRefKey.key);
                        this.$.saveSuccess.style.display = "block";
                        this.$.saveLoad.style.display = "none";
                    }
                }.bind(this));
            }.bind(this));
        }
    }

    _reportsUpdate(date, code) {
        var mm = date.substring(0, 7);
        var yy = date.substring(0, 4);

        var dayRef = this.firebaseRef.child("/" + code + "/reports/daily/" + date + '/patients');
        dayRef.once('value').then(function (snapshot) {
            dayRef.set(snapshot.val() + 1);
        });

        var yearRef = this.firebaseRef.child("/" + code + "/reports/yearly/" + yy + '/patients');
        yearRef.once('value').then(function (snapshot) {
            yearRef.set(snapshot.val() + 1);
        });

        var monthRef = this.firebaseRef.child("/" + code + "/reports/monthly/" + mm + '/patients');
        monthRef.once('value').then(function (snapshot) {
            monthRef.set(snapshot.val() + 1);
        });
    }

    _uploadProfile(prevProfile, newProfile, patientKey) {
        if (this.params && this.params.d) {
            var queueRef = this.firebaseRef.child("/" + this.myCode + "/queue/" + this.myData.location + "/" + this.params.d);
            var queueData = {
                patient_info: {
                    firstname: this.patient.personal.firstname,
                    middlename: this.patient.personal.middlename,
                    lastname: this.patient.personal.lastname,
                    birthday: this.patient.personal.birthday,
                    sex: this.patient.personal.sex ? this.patient.personal.sex : "",
                    name: this.patient.personal.name,
                    hmo: this.patient.insurance.primary_insurance
                },
                patient_profile: this.patient.profile ? this.patient.profile : null
            };
            var queueKey;

            if (this.params.q) {
                queueRef.child(this.params.q).update(queueData);
                queueKey = this.params.q;
            } else {
                queueData.patient_refKey = patientKey;
                queueData.patient_no = this.patient.no;
                queueData.queueLocation = this.myData.location;
                queueData.isCancel = false;
                queueData.isQueue = true;
                queueData.isNext = true;
                queueData.queueNo = 1;
                queueData.xy = "y";
                queueKey = queueRef.push().key;

                queueRef.once('value').then(function (snapshot) {
                    if (snapshot.exists()) {
                        queueRef.orderByChild("isNext").equalTo(true).once('value').then(function (hasNext) {
                            if (hasNext.exists()) {
                                queueData.isNext = false;
                                queueData.queueNo = snapshot.numChildren() + 1;
                                queueRef.child(queueKey).update(queueData);
                            } else {
                                queueData.queueNo = snapshot.numChildren() + 1;
                                queueRef.child(queueKey).update(queueData);
                            }
                        });
                    } else {
                        queueRef.child(queueKey).update(queueData);
                    }
                });
            }
        }

        if (newProfile) {
            if (prevProfile) {
                firebase.storage().refFromURL(prevProfile).delete().catch(err => {
                    console.warn(err);
                });
            }

            const filename = new Date().getTime() + "." + newProfile.name;
            firebase.storage().ref('profilePicture/' + filename).put(newProfile).then(snapshot => snapshot.ref.getDownloadURL()).then(function (url) {
                this.firebaseRef.child("/" + this.myCode + "/patients/" + patientKey + "/profile").set(url);
                if (queueKey) queueRef.child(queueKey).update({ patient_profile: url })
            }.bind(this));
        }
    }

    _nameChanged(f, m, l) {
        if (this.selectedPage == 1) {
            f = f.toUpperCase();
            m = m.toUpperCase();
            l = l.toUpperCase();

            this.set('patient.personal.firstname', f);
            this.set('patient.personal.middlename', m);
            this.set('patient.personal.lastname', l);

            if (f && l) {
                this.favrighthide = false;
                this.patient.personal.name = l + ", " + f + " " + m;
            } else {
                this.favrighthide = true;
            }
        }
    }

    _changepic(e) {
        const _$ = this;
        const file = e.target.files[0];

        if (!file) {
            this.profile = null;
            this.uploadText = "Upload profile picture";
            this.$.profilePic.src = '../images/user.png';
            this.$.p_profile.src = '../images/user.png';
            return;
        }

        new Compressor(file, {
            quality: 0.8,
            width: 440,
            height: 400,
            success(result) {
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL(result);

                _$.profile = result;
                _$.uploadText = result.name;
                _$.$.profilePic.src = imageUrl;
                _$.$.p_profile.src = imageUrl;
            },
            error(err) {
                _$.uploadText = err.message;
            },
        });
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
        if (date) {
            if (this.selectedPage == 4) this.favrighthide = false;
            return formatDate(date, 'dd-month-yyyy');
        }

        if (this.selectedPage == 4) this.favrighthide = true;
        return 'Please pick a date!';
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

    _ageCalc(bday) {
        if (bday) {
            var newdateformat = /^([0-9]{4})[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|1\d|2\d|3[01])$/;
            bday = formatDate(bday, 'yyyy-mm-dd');
            if (bday.match(newdateformat)) {
                this.age = calculateAge(bday);
            }
            else {
                this.age = '';
            }
        }
        else {
            this.age = '';
        }

        return this.age;
    }

    _isEqual(e, f) { return e === f; }
    _toggleBack() { history.back(); }
}

window.customElements.define('patient-form', PatientForm);