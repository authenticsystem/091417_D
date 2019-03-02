import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { fbSnapshotToArray } from '../shared-functions.js';
import 'g-element/elements/g-datatable/g-datatable.js';

class MyUsers extends PolymerElement {
    constructor() {
        super();
        firebase.database().ref('/accounts').on('value', function (snapshot) {
            this.users = fbSnapshotToArray(snapshot);
        }.bind(this));
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display:block;
            }

            @media (max-width: 480px) {
                .polymer-card { margin: 0; }
            }
        </style>
        
        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">
              <app-toolbar primary="">
                <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                <div main-title="">Users</div>
              </app-toolbar>
            </app-header>

            <div class="polymer-card" style="overflow-x: auto;">
                <g-datatable data="[[users]]" id="datatable">
                    <div slot="no-results">No users found.</div>
                    <g-datatable-column header="Account Code" type="String" property="code"></g-datatable-column>
                    <g-datatable-column header="Designatory letters" type="String" property="designatory"></g-datatable-column>
                    <g-datatable-column header="Name" type="Object" property="name">
                        <template>
                            <span>[[value.firstname]]</span>
                            <span>[[value.middlename]]</span>
                            <span>[[value.lastname]]</span>
                            <span>[[value.suffix]]</span>
                        </template>
                    </g-datatable-column>
                    <g-datatable-column header="Cellphone" type="String" property="cellphone"></g-datatable-column>
                    <g-datatable-column header="Active" type="Boolean" property="active"></g-datatable-column>
                </g-datatable>
            </div>
        </app-header-layout>
    `;
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }
}

window.customElements.define('my-users', MyUsers);
