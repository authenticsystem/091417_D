import '@polymer/polymer/polymer-legacy.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
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
        </style>
  
        <neon-animated-pages selected="[[selectedPage]]" entry-animation="fade-in-animation" exit-animation="fade-out-animation">
            <neon-animatable>
                <div class="polymer-card none">
                    <div class="toolbar-select non-color">
                        <div class="textTemp" style="flex: 1;">Collection</div>
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
                                <paper-icon-button icon="my-icons:delete-forever" title="delete" noink on-tap="_delete"></paper-icon-button>
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
                                <g-datatable-column header="Collect From" type="String" property="collectFrom"></g-datatable-column>
                                <g-datatable-column header="Amount" type="Number" property="amount"></g-datatable-column>
                            </g-datatable>
                        </div>
                        <div style="text-align: right; padding: 10px 20px;">Total amount: &nbsp; [[total]].00</div>
                    </div>
                </div>
                <br><br><br>
            </neon-animatable>

            <neon-animatable>
                <div class="polymer-card" style="max-width: 800px;">                  
                    <g-input-suggest data="[[collectFromList]]" label="Collect From" value="{{collectFrom}}"></g-input-suggest>
                    <iron-pages attr-for-selected="name" selected="[[_toLowerCase(collectFrom)]]">
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

                    <div hidden="[[!query]]" style="padding: 8px;">
                        <div hidden="[[!isLoading]]" class="loading-indicator">
                            <paper-spinner active></paper-spinner>
                        </div>

                        <div hidden="[[_selection(selectedBilling.length, 0)]]" class="toolbar-select">
                            <div style="padding: 6px; margin-left: 6px;">
                                [[selectedBilling.length]] item(s) selected
                            </div>
                        </div>
                        <g-datatable hidden="[[isLoading]]" data="{{allBilling}}" id="billingDatatable" multi-selection selectable selected-items="{{selectedBilling}}">
                            <g-datatable-column header="Services" type="String" property="service"></g-datatable-column>
                            <g-datatable-column header="Collect From" type="String" property="billTo"></g-datatable-column>
                            <g-datatable-column header="Amount" type="Number" property="amount"></g-datatable-column>
                        </g-datatable>
                    </div>

                    <div style="text-align: right; margin-top: 16px;">
                        <paper-button style="margin-top: 0;" on-tap="_save" class="primary">Save</paper-button>
                        <paper-button style="margin-top: 0;" on-tap="_cancel" class="secondary">Cancel</paper-button>
                    </div>
                </div>
                <br><br><br>
            </neon-animatable>
        </neon-animated-pages>
    `,

    is: 'collection-datatable',

    properties: {
        myData: Object,
        myCode: String,
        hideDate: Boolean,
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
        collectFromList: {
            type: Array,
            value: ['Patient', 'PHILHEALTH', 'HMO', 'Hospital']
        },
        patient: String,
        patientHMO: String
    },

    observers: [
        '_selectedPageChanged(selectedPage)',
        '_queryChanged(collectFrom, useInsurance, hmo, hospital)'
    ],

    created() {
        this.data = [];
        this.allBilling = [];
        this.firebaseRef = firebase.database().ref();
        this.selectedPage = 0;
        this.isLoading = false;
        this.dateIssued = formatDate(new Date(), 'yyyy-mm-dd');
    },

    ready() {
        this.firebaseRef.child('/' + this.myCode + '/hmo').orderByChild('name').once('value', function (snapshot) {
            if (snapshot.exists()) this.hmos = fbSnapshotToArray(snapshot);
        }.bind(this));

        this.firebaseRef.child('/' + this.myCode + '/locations').orderByChild('location_name').once('value', function (snapshot) {
            if (snapshot.exists()) this.hospitals = fbSnapshotToArray(snapshot);
        }.bind(this));
    },

    _queryChanged(collectFrom, useInsurance, hmo, hospital) {
        this.query = null;
        if (this.selectedBilling.length > 0) this.$.billingDatatable.deselectAll();

        var service_collect_from;
        switch (this.collectFrom.toLowerCase()) {
            case "patient":
                service_collect_from = this.patient;
                break;
            case "philhealth":
                service_collect_from = "PHILHEALTH";
                break;
            case "hmo":
                service_collect_from = useInsurance && this.patientHMO ? this.patientHMO : hmo;
                break;
            case "hospital":
                service_collect_from = hospital;
                break;
        }

        if (service_collect_from) {
            this.isLoading = true;
            this._debounceJob = Debouncer.debounce(this._debounceJob,
                timeOut.after(500), () => {
                    this.query = this.patient + "_" + service_collect_from + "_false";
                    this.firebaseRef.child('/' + this.myCode + '/billing_data').orderByChild('patient_billTo_collected').equalTo(this.query).once('value', function (snapshot) {
                        this.allBilling = fbSnapshotToArray(snapshot);
                        this.isLoading = false;
                    }.bind(this));
                });
        }
    },

    _patientHasInsurance(use, insurance) {
        if (use && insurance) return true;
        if (!use || !insurance) return false;
    },

    _selectedPageChanged(e) { this.fire('page-changed', e); },
    _toggleChangeHMO() { this.useInsurance = !this.useInsurance; },
    _toLowerCase(e) { return e.toString().toLowerCase(); },
    _add() { this.selectedPage = 1; },
    _cancel() { this.selectedPage = 0; this._clear(); },
    _selection(e, f) { return e == f; },
    _computeTotal() { return addCommas(this.data.reduce((total, data) => total + data.amount, 0)); },
    _save() {
        if (!this.collectFrom) return alert('To whom whould you like to collect?');
        if (this.selectedBilling.length == 0) return alert('Please select at least one item!');

        this.selectedBilling = this.selectedBilling.map(item => {
            return {
                billing_data_key: item.$key,
                amount: item.amount,
                collectFrom: item.billTo,
                num: item.num,
                patient: this.patient,
                service: item.service,
                service_collect_from: item.service_bill_to,
                use_insurance: item.use_insurance
            };
        });

        function uniqueArray(array) {
            array = array.filter((array, index, self) =>
                index === self.findIndex((data) => (
                    data.billing_data_key === array.billing_data_key
                ))
            );

            return array;
        };

        this.data = uniqueArray(this.data.concat(this.selectedBilling));
        this.selectedPage = 0;
        this._clear();
    },

    _delete() {
        this.selectedItems.forEach(data => {
            const i = this.data.findIndex(x => x.num == data.num);
            this.splice('data', i, 1);
        });
        this.$.datatable.deselectAll();
    },

    _clear() {
        // set everything to default value
        this.collectFrom = "";
        this.useInsurance = true;
        if (this.selectedItems.length > 0) this.$.datatable.deselectAll();
        if (this.selectedBilling.length > 0) this.$.billingDatatable.deselectAll();
    },

});