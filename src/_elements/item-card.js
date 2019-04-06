import '@polymer/polymer/polymer-legacy.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { fbSnapshotToArray } from 'g-element/src/sharedFunctions.js';

Polymer({
    _template: html`
          <style include="shared-styles">
            :host {
                display: flex;
                flex-direction: column;
            }

            .pad {
                padding: 16px;
                @apply --layout-flex;
                @apply --layout-vertical;
            }

            table {
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                border: 1px solid #ddd;
                font-size: 12px;
            }

            th,
            td {
                text-align: left;
                padding: 8px;
            }

            tr:nth-child(even) {
                background-color: #f2f2f2
            }
          </style>
  
          <div>
              <div style="padding: 16px; color:gray; margin-bottom:-18px;">
                  <iron-icon icon="my-icons:watch-later"></iron-icon>
                  <time-ago style="font-size:14px; margin-top:10px;" datetime\$="[[_timeStampToDateTime(item.timestamp)]]">[[_timeStampToDateTime(item.timestamp)]]</time-ago>
              </div>
  
              <div class="pad">
                  <div style="display:flex">
                      <iron-image preload="" fade="" class="item-avatar" sizing="cover" src\$="[[_patientImg(item.patientinfo.profile)]]"></iron-image>
                      <div style="margin-left:10px;">
                          <div class="primary-text">[[item.patientinfo.name]]</div>
                          <div class="primary-text" style="color:gray">Ref#: [[item.ref]]</div>
                      </div>
                  </div>
                  <div style="margin-top: 12px;">
                      <template is="dom-if" if="[[_isEqual(queryTo, 'billing_data')]]">
                          <table>
                              <tr>
                                  <th>Services</th>
                                  <th>Bill To</th>
                                  <th>Amount</th>
                                  <th>Collected</th>
                              </tr>
                              <template is="dom-repeat" items="[[data]]">
                                  <tr>
                                      <td>[[item.service]]</td>
                                      <td>[[item.billTo]]</td>
                                      <td>[[item.amount]]</td>
                                      <td>[[_fixBoolean(item.collected)]]</td>
                                  </tr>
                              </template>
                          </table>
                      </template>
  
                      <template is="dom-if" if="[[_isEqual(queryTo, 'collection_data')]]">
                          <table>
                              <tr>
                                  <th>Services</th>
                                  <th>Collect From</th>
                                  <th>Amount</th>
                              </tr>
                              <template is="dom-repeat" items="[[data]]">
                                  <tr>
                                      <td>[[item.service]]</td>
                                      <td>[[item.collectFrom]]</td>
                                      <td>[[item.amount]]</td>
                                  </tr>
                              </template>
                          </table>
                      </template>
                  </div>
              </div>
          </div>
    `,

    is: 'item-card',

    properties: {
        item: {
            type: Object,
            observer: '_itemChanged'
        },
        myKey: String,
        queryTo: String,
        childTo: String,
        data: {
            type: Array,
            observer: 'dataChanged'
        },
        collected: {
            type: Boolean,
            notify: true
        }
    },

    _itemChanged(e) {
        firebase.database().ref('/' + this.myKey + '/' + this.queryTo).orderByChild(this.childTo).equalTo(e.ref).on('value', function (snapshot) {
            this.data = [];
            if (snapshot.exists()) {
                this.data = fbSnapshotToArray(snapshot);
                this.collected = this.data.some(e => e.collected);
            }
        }.bind(this));
    },

    _fixBoolean(e) {
        if (e) return 'Yes';
        return 'No';
    },

    _isEqual(e, f) {
        return e === f;
    },

    _timeStampToDateTime(ts) {
        return new Date(ts);
    },

    _patientImg(e) {
        if (e) return e;
        return '../images/user.png';
    },

    dataChanged(e) {
        this.fire('resize');
    }
});