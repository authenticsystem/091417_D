import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { ScriptLoader } from 'g-element/src/scriptLoader.js';
import { fbSnapshotToArray, formatDate } from 'g-element/src/sharedFunctions.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import 'chart.js/dist/Chart.min.js';

class MyDashboard extends PolymerElement {
    constructor() {
        super();
        this.firebaseRef = firebase.database().ref();
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host { display:block; }
            .section-holder {  margin: 0 16px;}
            
            .section-title {
                float: right;
                margin-top: 8px;
                margin-right: 8px;
                color: rgb(100, 100, 100);
                font-weight: 400;
                font-size: 14px;
            }

            .amount-holder {
                padding: 8px 8px 0;
                /* color: rgb(100, 100, 100); */
                font-weight: 500;
                font-size: 16px;
            }
            
            canvas {
                width: 100% !important;
                max-width: 900px;
                height: auto !important;
                margin: auto;
            }

            /*  SECTIONS  */
            .section {
                clear: both;
                padding: 0px;
                margin: 0px;
            }

            /*  COLUMN SETUP  */
            .col {
                background: #fff;
                text-align: center;
                display: block;
                float: left;
                margin: 1% 0 1% 0.88%;
            }

            .col:first-child {
                margin-left: 0;
            }

            /*  GROUPING  */
            .group:before,
            .group:after {
                content: "";
                display: table;
            }

            .group:after { clear: both; }
            .group { zoom: 1; /* For IE 6/7 */ }

            /*  GRID OF FIVE  */
            .col-5 { width: 100%; }
            .col-4 { width: 79.82%; }
            .col-3 { width: 59.64%; }
            .col-2 { width: 39.47%; }
            .col-1 { width: 19.29%; }
            
            .x { margin-top: -8px; }

            /*  GO FULL WIDTH BELOW 480 PIXELS */
            @media only screen and (max-width: 480px) {
                .x { margin-top: 0; }
                .section-holder { margin: 8px; }
                .section-title { padding: 8px; margin-top: 0; }
                .col { margin: 1% 0 1% 0%; }
                .col-1, .col-2, .col-3, .col-4, .col-5 { width: 100%; }
            }
        </style>

        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">
                <app-toolbar primary="">
                    <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                    <div main-title="">Dashboard</div>
                </app-toolbar>
            </app-header>

            <div class="section-holder">
                <div class="section-title">
                    Receivables
                </div>
                <div class="section group">
                    <div class="col col-1">
                        <div style="padding: 8px 8px 10px; border: 1px solid #f48989; background: #feefef;">
                            <div class="amount-holder" style="color:#da1414;">₱ [[r_patient]]</div>
                            <div class="small-text" style="color:#da1414;">Patients</div>
                        </div>
                    </div>
                    <div class="col col-1">
                        <div style="padding: 8px 8px 10px; border: 1px solid #5aca75; background: #edf9f0;">
                            <div class="amount-holder" style="color:#287d3c;">₱ [[r_philhealth]]</div>
                            <div class="small-text" style="color:#287d3c;">Philhealth</div>
                        </div>
                    </div>
                    <div class="col col-1">
                        <div style="padding: 8px 8px 10px; border: 1px solid #ff8f39; background: #fff4ec;">
                            <div class="amount-holder" style="color:#b95000;">₱ [[r_insurance]]</div>
                            <div class="small-text" style="color:#b95000;">Insurance</div>
                        </div>
                    </div>
                    <div class="col col-1">
                        <div style="padding: 8px 8px 10px; border: 1px solid #89a7e0; background: #eef2fa;">
                            <div class="amount-holder" style="color:#2e5aac;">₱ [[r_hospital]]</div>
                            <div class="small-text" style="color:#2e5aac;">Hospital</div>
                        </div>
                    </div>
                    <div class="col col-1">
                        <div style="padding: 8px 8px 10px; border: 1px solid rgba(54, 162, 235, 1); background: rgba(54, 162, 235, 0.2);">
                            <div class="amount-holder" style="color:blue;">₱ [[r_total]]</div>
                            <div class="small-text" style="color:blue;">Total</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding:26px; margin-top:-30px">
                <div style="float:right;">
                    <div style="display:flex;">
                        <iron-icon style="margin-top:30px; margin-right:10px" icon="my-icons:event"></iron-icon>
                        <paper-dropdown-menu style="cursor:pointer">
                            <paper-listbox slot="dropdown-content" selected="{{sectedRange}}">
                                <paper-item>Last 15 days</paper-item>
                                <paper-item>Last 12 months</paper-item>
                                <paper-item>Last 5 years</paper-item>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                    <div style="margin-left:34px;margin-top:-10px;">
                        <span class="small-text">{{text}}</span>
                    </div>
                </div>
            </div>

            <div class="polymer-card" style="margin-top: -14px;">
                <canvas id="patientChart"></canvas>
            </div>

            <div class="polymer-card x">
                <canvas id="visitChart"></canvas>
            </div>

        </app-header-layout>
      `;
    }

    static get properties() {
        return {
            myData: Object,
            scriptsLoaded: Boolean,
            patientChart: Object,
            visitChart: Object,
            sectedRange: {
                type: Number,
                value: 0
            },
            prevRange: String
        };
    }

    static get observers() {
        return [
            '_selectedRangeChanged(sectedRange, scriptsLoaded)'
        ];
    }

    ready() {
        super.ready();
        new ScriptLoader([
            "node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.js"
        ], function () {
            this.scriptsLoaded = true;
        }.bind(this));

        this.firebaseRef.child('/' + this.myData.code + '/receivables').on('value', function (snapshot) {
            this.r_hospital = 0; this.r_insurance = 0; this.r_patient = 0; this.r_philhealth = 0; this.r_total = 0;
            if (snapshot.exists()) {
                var r_hospital = snapshot.val().hospital ? snapshot.val().hospital : 0;
                var r_insurance = snapshot.val().hmo ? snapshot.val().hmo : 0;
                var r_patient = snapshot.val().patient ? snapshot.val().patient : 0;
                var r_philhealth = snapshot.val().philhealth ? snapshot.val().philhealth : 0;

                this.r_hospital = formatN(r_hospital);
                this.r_insurance = formatN(r_insurance);
                this.r_patient = formatN(r_patient);
                this.r_philhealth = formatN(r_philhealth);
                this.r_total = formatN(r_hospital + r_insurance + r_patient + r_philhealth);
            }
        }.bind(this));

        function formatN(n) {
            if (n > 0) return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            return n;
        }
    }

    _selectedRangeChanged() {
        if (this.scriptsLoaded) {
            var last, limit, range, text;
            var date = new Date();
            var today = formatDate(date, 'month dd, yyyy');

            var monthNames = [
                "Jan", "Feb", "Mar",
                "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct",
                "Nov", "Dec"
            ];

            if (this.sectedRange == 0) {
                date.setDate(date.getDate() - 14);

                var MM = date.getMonth();
                var day = date.getDate();
                var month = date.getMonth() + 1;
                if (month < 10) { month = '0' + month };
                if (day < 10) { day = '0' + day };

                this.text = monthNames[MM] + ' ' + day + ' - ' + today;
                last = date.getFullYear() + '-' + month + '-' + day;
                range = 'daily';
                limit = 15;
                text = 'last 15 days';
            }

            if (this.sectedRange == 1) {
                date.setMonth(date.getMonth() - 11);

                var MM = date.getMonth();
                var month = date.getMonth() + 1;
                if (month < 10) { month = '0' + month };

                this.text = monthNames[MM] + ' ' + date.getFullYear() + ' - ' + today;
                last = date.getFullYear() + '-' + month;
                range = 'monthly';
                limit = 12;
                text = 'last 12 months';
            }

            if (this.sectedRange == 2) {
                date.setFullYear(date.getFullYear() - 4);

                var year = date.getFullYear();

                this.text = year + ' - ' + today;
                last = year.toString();
                range = 'yearly';
                limit = 5;
                text = 'last 5 years';
            }

            var patientChart = new Chart(this.$.patientChart, {
                type: 'line',
                options: {
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            backgroundColor: 'rgba(255, 99, 132, 1)',
                            // borderColor: 'rgba(255, 99, 132, 0.2)',
                            borderRadius: 2,
                            borderWidth: 1,
                            color: 'white'
                        }
                    },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'No. of new patients in the ' + text
                    }
                }
            });

            var visitChart = new Chart(this.$.visitChart, {
                type: 'line',
                options: {
                    elements: {
                        line: {
                            tension: 0, // disables bezier curves
                        }
                    },
                    plugins: {
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            backgroundColor: 'rgba(54, 162, 235, 1)',
                            // borderColor: 'rgba(54, 162, 235, 0.2)',
                            borderRadius: 2,
                            borderWidth: 1,
                            color: 'white'
                        }
                    },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'No. of visits in the ' + text
                    }
                }
            });
        }

        this._debounceJob = Debouncer.debounce(this._debounceJob,
            timeOut.after(500), () => {
                this.getData(this.myData.code, range, last, limit, patientChart, visitChart, monthNames);
            });
    }

    getData(myKey, range, last, limit, patientChart, visitChart, monthNames) {
        if (this.prevRange) {
            this.firebaseRef.child("/" + myKey + "/reports/" + this.prevRange).off();
        }

        this.prevRange = range;
        this.firebaseRef.child("/" + myKey + "/reports/" + range).orderByKey().startAt(last).limitToFirst(limit).on("value", function (snapshot) {
            var returnArr = [];
            var returnArr2 = [];
            var labelDate = [];

            snapshot.forEach(element => {

                returnArr.push(element.val().patients);
                returnArr2.push(element.val().visits);

                if (range == 'daily') {
                    var month = new Date(element.key).getMonth();
                    labelDate.push(element.key.substring(8, 10));
                }

                if (range == 'monthly') {
                    var month = new Date(element.key).getMonth();
                    labelDate.push(monthNames[month]);
                }

                if (range == 'yearly') {
                    labelDate.push(element.key.substring(0, 4));
                }
            });

            var patientData = {
                labels: labelDate,
                datasets: [{
                    label: 'No. of Patients',
                    data: returnArr,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }],
            };

            var visitData = {
                labels: labelDate,
                datasets: [{
                    label: 'No. of Visits',
                    data: returnArr2,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }],
            };

            patientChart.data = patientData;
            patientChart.update();

            visitChart.data = visitData;
            visitChart.update();
        });
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }
}

window.customElements.define('my-dashboard', MyDashboard);