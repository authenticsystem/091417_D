import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { formatDate } from '../shared-functions.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '@polymer/paper-fab/paper-fab.js'
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-badge/paper-badge.js';
import 'g-element/elements/g-notification.js';
import 'g-element/elements/g-search.js';

class MyDoctor extends PolymerElement {
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
                <app-header fixed="">
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
                        <a name="dashboard" href="[[rootPath]]">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:dashboard" slot="item-icon"></iron-icon>
                                <span>Dashboard</span>
                            </paper-icon-item>
                        </a>
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
                        <a name="visits" href="[[rootPath]]visits">
                            <paper-icon-item toggles="true" class="menuSelected">
                                <iron-icon icon="my-icons:folder-open" slot="item-icon"></iron-icon>
                                <span>Visits</span>
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
                            <a name="settings" href="[[rootPath]]settings">
                                <paper-icon-item toggles="true" class="menuSelected">
                                    <iron-icon icon="my-icons:settings" slot="item-icon"></iron-icon>
                                    <span>Settings</span>
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
            <my-dashboard name="dashboard" my-data="[[myData]]"></my-dashboard>
            <my-patients name="patients" route="[[subroute]]" my-data="[[myData]]"></my-patients>
            <my-queue name="queue" route="[[subroute]]" my-data="[[myData]]"></my-queue>
            <my-visits name="visits" route="[[subroute]]" my-data="[[myData]]"></my-visits>
            <my-billing name="billing" route="[[subroute]]" my-data="[[myData]]"></my-billing>
            <my-collection name="collection" route="[[subroute]]" my-data="[[myData]]"></my-collection>
            <my-messaging name="messaging" my-data="[[myData]]"></my-messaging>
            <my-settings name="settings" route="[[subroute]]" user="[[user]]" my-data="[[myData]]"></my-settings>
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
            msg: {
                type: Number,
                value: 0
            },
            inQueue: {
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
        this.$.notification.requestPermission();
        firebase.database().ref('/' + this.myData.code + '/uniqueId/msg').on('value', function (snapshot) {
            if (snapshot.exists()) this.msg = snapshot.val();
        }.bind(this));
        this.addEventListener('toggleDrawer', () => this._toggleDrawer());
    }

    _routePageChanged(page) {
        if (!page) {
            this.page = 'dashboard';
        } else if (['dashboard', 'patients', 'queue', 'visits', 'billing', 'collection', 'messaging', 'settings', 'location'].indexOf(page) !== -1) {
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
            const today = formatDate(new Date(), 'yyyy-mm-dd');
            firebase.database().ref("/" + this.myData.code + "/queue/" + this.myData.location + "/" + today).orderByChild("isQueue").equalTo(true).on('value', function (snapshot) {
                if (snapshot.exists()) {
                    const inQueue = snapshot.numChildren();
                    if (inQueue > this.inQueue && (this.page !== "queue" || !document.hasFocus())) {
                        var message;
                        this.inQueue = inQueue;
                        if (inQueue == 1) message = `You have ${inQueue} patient waiting in queue.`;
                        else message = `You have ${inQueue} patients waiting in queue.`;
                        this._sendNotification(message, 'queue', true);
                    }
                }
            }.bind(this));

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
            case 'dashboard':
                this._showLoader(true);
                import('./my-dashboard.js').then(() => this._showLoader(false));
                break;
            case 'patients':
                this._showLoader(true);
                import('./my-patients.js').then(() => this._showLoader(false));
                break;
            case 'queue':
                this._showLoader(true);
                import('./my-queue.js').then(() => this._showLoader(false));
                break;
            case 'visits':
                this._showLoader(true);
                import('./my-visits.js').then(() => this._showLoader(false));
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
            case 'settings':
                this._showLoader(true);
                import('./my-settings.js').then(() => this._showLoader(false));
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

window.customElements.define('my-doctor', MyDoctor);