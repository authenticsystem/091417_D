import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { fbSnapshotToArray } from '../shared-functions.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '@polymer/paper-fab/paper-fab.js'
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-badge/paper-badge.js';
import 'g-element/elements/g-notification.js';
import 'g-element/elements/g-search.js';

class MySecretary extends PolymerElement {
    static get template() {
        return html`
      <style include="shared-styles">
        :host {
            display:block;
        }

        paper-fab {
            position: fixed;
            right: 26px;
            bottom: -16px;
        }
      </style>

      <g-notification id="notification" is-granted="{{isNotificationGranted}}"></g-notification>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
            <app-header-layout>
                <app-header>
                    <app-toolbar class="main-toolbar"> 
                        <div class="avatar-container" top-item>
                            <iron-image preload="" fade="" sizing="cover" placeholder="../../images/user.png" class="image" src\$="[[_src(user.photoURL)]]"></iron-image>
                        </div>
                        <div class="contact-info" bottom-item	>
                            <div class="name" hidden="[[user.displayName]]">[[user.email]]</div>
                            <div class="name" hidden="[[!user.displayName]]">[[user.displayName]]</div>
                            <div class="email">[[myData.designatory]] @ [[myData.location]]</div>
                        </div>
                    </app-toolbar>
                    <a href="/location">
                        <paper-fab mini="" icon="my-icons:my-location"></paper-fab>
                    </a>
                </app-header>
          
                <div class="content-list">
                    <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
                        <a name="patients" href="[[rootPath]]patients">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:people" slot="item-icon"></iron-icon>
                                <span>Patients</span>
                            </paper-icon-item>
                        </a>
                        <a name="queue" href="[[rootPath]]queue">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:list" slot="item-icon"></iron-icon>
                                <span>Queue</span>
                            </paper-icon-item>
                        </a>
                        <a name="billing" href="[[rootPath]]billing">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:send" slot="item-icon"></iron-icon>
                                <span>Billing</span>
                            </paper-icon-item>
                        </a>
                        <a name="collection" href="[[rootPath]]collection">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:payment" slot="item-icon"></iron-icon>
                                <span>Collection</span>
                            </paper-icon-item>
                        </a>
                        <a name="messaging" href="[[rootPath]]messaging">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon id="messageIcon" icon="my-icons:chat" slot="item-icon"></iron-icon>
                                <paper-badge for="messageIcon" label="[[msg]]"></paper-badge>
                                <span>Messaging</span>
                            </paper-icon-item>
                        </a>
                        <div class="breaker"></div>
                            <a name="account" href="[[rootPath]]account">
                                <paper-icon-item toggles="true" class="menuSelected">
                                    <iron-icon icon="my-icons:account-circle" slot="item-icon"></iron-icon>
                                    <span>My Account</span>
                                </paper-icon-item>
                            </a>
                        <div class="breaker"></div>
                        <a on-tap="_signOut">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:power-settings-new" slot="item-icon"></iron-icon>
                                <span>Sign Out</span>
                            </paper-icon-item>
                        </a>
                    </iron-selector>
                </div>

                <footer>
                    Copyright © 2019 BaseEMR v1.0.0
                </footer>
            </app-header-layout>
        </app-drawer>

        <!-- Main content -->
        <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
            <my-patients name="patients" route="[[subroute]]" my-data="[[myData]]" my-doctors="[[myDoctors]]"></my-patients>
            <my-queue name="queue" route="[[subroute]]" my-data="[[myData]]" my-doctors="[[myDoctors]]"></my-queue>
            <my-billing name="billing" route="[[subroute]]" my-data="[[myData]]" my-doctors="[[myDoctors]]"></my-billing>
            <my-collection name="collection" route="[[subroute]]" my-data="[[myData]]" my-doctors="[[myDoctors]]"></my-collection>
            <my-messaging name="messaging" my-data="[[myData]]" my-doctors="[[myDoctors]]"></my-messaging>
            <user-account name="account" user="[[user]]" my-data="[[myData]]"></user-account>
            <user-location name="location" my-data="[[myData]]"></user-location>
            <my-view404 name="view404"></my-view404>
        </iron-pages>
      </app-drawer-layout>
    `;
    }

    static get importMeta() {
        return import.meta;
    }

    static get properties() {
        return {
            page: {
                type: String,
                reflectToAttribute: true,
                observer: '_pageChanged'
            },
            myDoctors: {
                type: Array,
                value: null
            },
            msg: {
                type: Number,
                value: 0
            },
            user: Object,
            myData: Object,
            routeData: Object,
            subroute: Object
        };
    }

    static get observers() {
        return [
            '_routePageChanged(routeData.page)',
            '_isNotificationGranted(isNotificationGranted, msg)'
        ];
    }

    ready() {
        super.ready();
        firebase.database().ref('/' + this.myData.code + '/doctors').orderByChild('location').equalTo(this.myData.location).on('value', function (snapshot) {
            if (snapshot.exists()) this.myDoctors = fbSnapshotToArray(snapshot);
        }.bind(this));
        firebase.database().ref('/' + this.myData.code + '/uniqueId/msg').on('value', function (snapshot) {
            if (snapshot.exists()) this.msg = snapshot.val();
        }.bind(this));
        this.addEventListener('toggleDrawer', () => this._toggleDrawer());
    }

    _routePageChanged(page) {
        if (!page) {
            this.page = 'patients';
        } else if (['patients', 'queue', 'billing', 'collection', 'messaging', 'account', 'location'].indexOf(page) !== -1) {
            this.page = page;
        } else {
            this.page = 'view404';
        }

        // Close a non-persistent drawer when the page & route are changed.
        if (!this.$.drawer.persistent) {
            this.$.drawer.close();
        }
    }

    _isNotificationGranted(e, msg) {
        if (e) {
            if (msg > 0 && (this.page !== "messaging" || !document.hasFocus())) {
                var message;
                if (msg == 1) message = `You have ${msg} unread message.`;
                else message = `You have ${msg} unread messages.`;
                this._sendNotification(message, 'message', false);
            }
        }
    }

    _pageChanged(page) {
        switch (page) {
            case 'patients':
                this._showLoader(true);
                import('./my-patients.js').then(() => this._showLoader(false));
                break;
            case 'queue':
                this._showLoader(true);
                import('./my-queue.js').then(() => this._showLoader(false));
                break;
            case 'billing':
                this._showLoader(true);
                import('./my-billing.js').then(() => this._showLoader(false));
                break;
            case 'collection':
                this._showLoader(true);
                import('./my-collection.js').then(() => this._showLoader(false));
                break;
            case 'messaging':
                this._showLoader(true);
                import('./my-messaging.js').then(() => this._showLoader(false));
                break;
            case 'account':
                this._showLoader(true);
                import('../_elements/user-account.js').then(() => this._showLoader(false));
                break;
            case 'location':
                this._showLoader(true);
                import('../_elements/user-location.js').then(() => this._showLoader(false));
                break;
            case 'view404':
                import('../_main/my-view404.js');
                break;
        }
    }

    _sendNotification(body, tag, requireInteraction) {
        this.$.notification.sendNotification({
            title: "BaseEMR",
            icon: "../../images/icon.png",
            badge: "../../images/icon.png",
            body: body,
            tag: tag,
            requireInteraction: requireInteraction,
            renotify: true
        });
    }

    _signOut() {
        this.dispatchEvent(new CustomEvent('signOut', {
            bubbles: true, composed: true
        }));
    }

    _showLoader(show) {
        this.dispatchEvent(new CustomEvent('showLoader', {
            bubbles: true, composed: true, detail: show
        }));
    }

    _toggleDrawer() {
        var drawerlayout = this.$.drawerLayout;
        if (drawerlayout.forceNarrow || !drawerlayout.narrow) {
            drawerlayout.forceNarrow = !drawerlayout.forceNarrow;
        } else {
            drawerlayout.drawer.toggle();
        }
    }

    _src(e) {
        if (e) return e;
        return '../../images/user.png';
    }
}

window.customElements.define('my-secretary', MySecretary);