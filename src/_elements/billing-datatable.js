import '@polymer/polymer/polymer-legacy.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { fbSnapshotToArray, formatDate, addCommas } from '../shared-functions.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import 'g-element/elements/g-datatable/g-datatable.js';
import 'g-element/elements/g-input-suggest.js';

Polymer({
    _template: html`
        <style include="shared-styles">
            :host {
                display: block;
            }

            .toolbar-select {
                display: flex;
                background: var(--paper-pink-50);
                color: var(--accent-color);
                padding: 6px;
            }

            .non-color {
                background: none;
                color: black;
            }

            .polymer-card { max-width: 826px; }
            @media (min-width: 480px) {
                .polymer-card {
                    margin: 16px auto;
                }
            }

            .none {
                background: none;
                box-shadow: none;
                padding: 0;
            }

            .textTemp {
                color: rgb(100, 100, 100);
                font-weight: 500;
                font-size: 14px;
                margin-top: 8px;
            }

            paper-dropdown-menu { width: 100% }
        </style>
  
        <neon-animated-pages selected="[[selectedPage]]" entry-animation="fade-in-animation" exit-animation="fade-out-animation">
            <neon-animatable>
                <div class="polymer-card none">
                    <div class="toolbar-select non-color">
                        <div class="textTemp" style="flex: 1;">Billing</div>
                        <div style="text-align:right; flex: 1;">
                            <paper-button style="margin-top: 0;" on-tap="_add" class="primary">Add New</paper-button>
                        </div>
                    </div>
                    <div class="polymer-card" style="padding: 0; margin: 0;">
                        <div hidden="[[_selection(selectedItems.length, 0)]]" class="toolbar-select">
                            <div style="padding:6px; margin-left:6px; flex: 1;">
                                [[selectedItems.length]] item(s) selected
                            </div>
                            <div style="text-align:right; flex: 1;">
                                <paper-icon-button hidden="[[_selectionEdit(hideEdit, selectedItems.length, 1)]]" icon="my-icons:edit" title="edit" noink on-tap="_edit"></paper-icon-button>
                                <paper-icon-button hidden="[[hideRemove]]" icon="my-icons:delete-forever" title="delete" noink on-tap="_delete"></paper-icon-button>
                            </div>
                        </div>

                        <div class="toolbar-select non-color">
                            <div style="padding:6px;">
                                <paper-input hidden="[[hideDate]]" label="Date issued *" type="date" value="{{dateIssued}}" style="width:150px">
                                    <iron-icon icon="my-icons:event" slot="prefix"></iron-icon>
                                </paper-input>
                                <paper-input style="width:250px" label="Remarks" value="{{remarks}}" always-float-label=""></paper-input>
                            </div>
                        </div>

                        <div style="padding: 6px;">
                            <g-datatable data="[[data]]" id="datatable" multi-selection selectable selected-items="{{selectedItems}}">
                                <g-datatable-column header="Services" type="String" property="service"></g-datatable-column>
                                <g-datatable-column header="Bill To" type="String" property="billTo"></g-datatable-column>
                                <g-datatable-column header="Amount" type="Number" property="amount"></g-datatable-column>
                                <template is="dom-if" if="[[showCollected]]">
                                    <g-datatable-column header="Collected" type="Boolean" property="collected"></g-datatable-column>
                                </template>
                            </g-datatable>
                        </div>
                        <div style="text-align: right; padding: 10px 20px;">Total amount: &nbsp; [[total]].00</div>
                    </div>
                </div>
                <br><br><br>
            </neon-animatable>

            <neon-animatable>
                <template is="dom-if" if="[[_isPageOne(selectedPage)]]" restamp>
                    <div class="polymer-card" style="max-width: 800px;">                  
                        <g-input-suggest field="service" data="[[services]]" label="Service *" selected-item="{{service}}" value="[[serviceValue]]"></g-input-suggest>
                        <paper-input label="Amount" allowed-pattern="[\\d]" prevent-invalid-input="" always-float-label value="{{service.rate}}"></paper-input>
                        <g-input-suggest data="[[billToList]]" label="Bill to" value="{{billTo}}"></g-input-suggest>

                        <iron-pages attr-for-selected="name" selected="[[_toLowerCase(billTo)]]">
                            <div name="patient">
                                <paper-input readonly="" label="Patient" value="[[patient]]"></paper-input>
                            </div>

                            <div name="hmo">
                                <div hidden="[[!_patientHasInsurance(useInsurance, patientHMO)]]">
                                    <paper-input readonly="" label="HMO" value="{{patientHMO}}"></paper-input>
                                    <a style="font-size: 12px;" hidden="[[!useInsurance]]" on-tap="_toggleChangeHMO">Change HMO!</a>
                                </div>

                                <div hidden="[[_patientHasInsurance(useInsurance, patientHMO)]]">
                                    <g-input-suggest field="name" data="[[hmos]]" label="HMO" value="{{hmo}}"></g-input-suggest>
                                    <a style="font-size: 12px;" hidden="[[useInsurance]]" on-tap="_toggleChangeHMO">Use default HMO!</a>
                                </div>
                            </div>

                            <div name="hospital">
                                <g-input-suggest field="location_name" data="[[hospitals]]" label="Hospital" value="{{hospital}}"></g-input-suggest>
                            </div>
                        </iron-pages>
                        
                        <div style="text-align: right; margin-top: 16px;">
                            <paper-button style="margin-top: 0;" on-tap="_save" class="primary">Save</paper-button>
                            <paper-button style="margin-top: 0;" on-tap="_cancel" class="secondary">Cancel</paper-button>
                        </div>
                    </div>
                </template>
                <br><br><br>
            </neon-animatable>
        </neon-animated-pages>
    `,

    is: 'billing-datatable',

    properties: {
        myData: Object,
        myCode: String,
        hideDate: Boolean,
        hideEdit: Boolean,
        showCollected: Boolean,
        hideRemove: Boolean,
        remarks: {
            type: String,
            notify: true
        },
        useInsurance: {
            type: Boolean,
            value: true
        },
        data: {
            type: Array,
            value: [],
            notify: true
        },
        total: {
            type: Number,
            notify: true,
            computed: '_computeTotal(data.splices)'
        },
        dateIssued: {
            type: Date,
            notify: true,
        },
        billToList: {
            type: Array,
            value: ['Patient', 'PHILHEALTH', 'HMO', 'Hospital']
        },
        logs: {
            type: Array,
            value: [],
            notify: true
        },
        patient: String,
        patientHMO: String
    },

    observers: ['_selectedPageChanged(selectedPage)'],

    created() {
        this.data = [];
        this.logs = [];
        this.firebaseRef = firebase.database().ref();
        this.selectedPage = 0;
        this.dateIssued = formatDate(new Date(), 'yyyy-mm-dd');
    },

    ready() {
        this.firebaseRef.child('/' + this.myCode + '/services').orderByChild('service').once('value', function (snapshot) {
            if (snapshot.exists()) this.services = fbSnapshotToArray(snapshot);
        }.bind(this));

        this.firebaseRef.child('/' + this.myCode + '/hmo').orderByChild('name').once('value', function (snapshot) {
            if (snapshot.exists()) this.hmos = fbSnapshotToArray(snapshot);
        }.bind(this));

        this.firebaseRef.child('/' + this.myCode + '/locations').orderByChild('location_name').once('value', function (snapshot) {
            if (snapshot.exists()) this.hospitals = fbSnapshotToArray(snapshot);
        }.bind(this));
    },

    _patientHasInsurance(use, insurance) {
        if (use && insurance) return true;
        if (!use || !insurance) return false;
    },

    _selectedPageChanged(e) { this.fire('page-changed', e); },
    _toggleChangeHMO() { this.useInsurance = !this.useInsurance; },
    _toLowerCase(e) { return e.toString().toLowerCase(); },
    _add() { if (this.selectedItems.length > 0) this.$.datatable.deselectAll(); this.selectedPage = 1; },
    _cancel() { this.selectedPage = 0; this._clear(); },
    _isPageOne(page) { return page == 1; },
    _selection(e, f) { return e == f; },
    _selectionEdit(s, e, f) { if (s) return s; return e !== f },
    _computeTotal() { return addCommas(this.data.reduce((total, data) => total + data.amount, 0)); },
    _save() {
        if (!this.service) return alert('Please choose a service!');
        if (!this.service.rate) return alert('Please input a service amount!');
        if (!this.billTo) return alert('To whom whould you like to bill this to?');

        this.billTo = this.billTo.toLowerCase()
        var service_bill_to;

        switch (this.billTo) {
            case "patient":
                service_bill_to = this.patient;
                break;
            case "philhealth":
                service_bill_to = "PHILHEALTH";
                break;
            case "hmo":
                service_bill_to = this.useInsurance && this.patientHMO ? this.patientHMO : this.hmo;
                break;
            case "hospital":
                service_bill_to = this.hospital;
                break;
        }

        if (!service_bill_to) return alert('To whom whould you like to bill this to?');
        if (this.selectedItems[0]) {
            const i = this.data.findIndex(x => x.num == this.selectedItems[0].num);
            const logIndex = this.logs.findIndex(x => x.data.num == this.selectedItems[0].num);

            this.set('data.' + i + '.service', this.service.service);
            this.set('data.' + i + '.amount', parseInt(this.service.rate));
            this.set('data.' + i + '.billTo', service_bill_to);
            this.set('data.' + i + '.service_bill_to', this.billTo);
            this.set('data.' + i + '.use_insurance', this.useInsurance);
            this.notifyPath("data", this.data.slice());

            const logData = this.data[i];
            // if (logData.$key && logIndex === -1) this.push('logs', { action: 'changed', data: logData }); else 
            this.set('logs.' + logIndex + '.data', logData);
        } else {
            const number = new Date().getTime();
            const data = {
                num: number,
                service: this.service.service,
                amount: parseInt(this.service.rate),
                billTo: service_bill_to,
                service_bill_to: this.billTo,
                use_insurance: this.useInsurance
            };
            this.push('data', data);
            this.push('logs', { action: 'added', data: data });
        }

        this.selectedPage = 0;
        this._clear();
    },

    _edit() {
        this.serviceValue = this.selectedItems[0].service;
        this.service = { service: this.selectedItems[0].service, rate: this.selectedItems[0].amount };
        this.useInsurance = this.selectedItems[0].use_insurance;
        switch (this.selectedItems[0].service_bill_to) {
            case "patient":
                this.billTo = "Patient";
                break;
            case "philhealth":
                this.billTo = "PHILHEALTH";
                break;
            case "hmo":
                this.billTo = "HMO";
                this.hmo = this.selectedItems[0].billTo;
                break;
            case "hospital":
                this.billTo = "Hospital";
                this.hospital = this.selectedItems[0].billTo;
                break;
        }
        this.selectedPage = 1;
    },

    _delete() {
        this.selectedItems.forEach(data => {
            const i = this.data.findIndex(x => x.num == data.num);
            const logIndex = this.logs.findIndex(x => x.data.num == data.num);
            const logData = this.data[i];

            this.splice('data', i, 1);
            if (logData.$key && logIndex === -1) this.push('logs', { action: 'removed', data: logData });
            else if (logData.$key && logIndex !== -1) this.set('logs.' + i + '.action', 'removed');
            else this.splice('logs', logIndex, 1);
        });
        this.$.datatable.deselectAll();
    },

    _clear() {
        // set everything to default value
        this.service = {};
        this.serviceValue = "";
        this.billTo = "";
        this.useInsurance = true;
        if (this.selectedItems.length > 0) this.$.datatable.deselectAll();
    },

});