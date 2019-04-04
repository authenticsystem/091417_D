/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { ScriptLoader } from 'g-element/src/scriptLoader.js';
import { sharedLoader } from './shared-loader.js';
import { firebaseDev, firebaseLive } from './_data/config.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-spinner/paper-spinner.js';
import './my-icons.js';
import './shared-styles.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(MyAppGlobals.rootPath);

class MyApp extends PolymerElement {
  static get template() {
    return html`
      ${sharedLoader}
      <style>
        :host {
          --app-primary-color: #673AB7;
          --app-secondary-color: black;

          display: block;
        }

        #overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .reloadButton {
          color: yellow;
          font-size: 15px;
          cursor: pointer;
          text-transform: none;
          padding: 0;
          margin-left: 6px;
        }

        .reloadButton:hover {
          color: yellow;
          opacity: 0.8;
        }
      </style>

      <div id="overlay">
        <paper-spinner active></paper-spinner>
      </div>

      <div hidden="[[!gettingUser]]" class="loader">
        <div class="pulse"></div>
        <p>checking your heart beat...</p>  
      </div>

      <template is="dom-if" if="[[!user]]">
        <app-location route="{{route}}" url-space-regex="^[[rootPath]]"></app-location>
        <app-route route="{{route}}" pattern="[[rootPath]]:page"></app-route>

        <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
          <template is="dom-if" if="[[_isEqual(page, 'sign-in')]]" restamp>
            <my-sign-in name="sign-in"></my-sign-in>
          </template>
          <template is="dom-if" if="[[_isEqual(page, 'create-account')]]" restamp>
            <my-create-account name="create-account"></my-create-account>
          </template>
          <template is="dom-if" if="[[_isEqual(page, 'reset-password')]]" restamp>
            <my-reset-password name="reset-password"></my-reset-password>
          </template>
        </iron-pages>
      </template>

      <template is="dom-if" if="[[user]]">
        <template is="dom-if" if="[[!user.emailVerified]]" restamp>
          <my-email-verification user="[[user]]"></my-email-verification>
        </template>

        <template is="dom-if" if="[[user.emailVerified]]">
          <template is="dom-if" if="[[!user.phoneNumber]]" restamp>
            <my-account-link user="[[user]]"></my-account-link>
          </template>

          <template is="dom-if" if="[[user.phoneNumber]]">
            <template is="dom-if" if="[[_isEqual(myData.role, 'System Admin')]]">
              <my-admin user="[[user]]" my-data="[[myData]]"></my-admin>
            </template>

            <template is="dom-if" if="[[_isEqual(myData.role, 'Doctor')]]">
              <my-doctor user="[[user]]" my-data="[[myData]]"></my-doctor>
            </template>

            <template is="dom-if" if="[[_isEqual(myData.role, 'Secretary')]]">
              <my-secretary user="[[user]]" my-data="[[myData]]"></my-secretary>
            </template>
          </template>
        </template>
      </template>

      <paper-toast id="toast" duration="0" text="New version available">
        <paper-button class="reloadButton" noink onclick="window.location.reload(true)">Update Now</paper-button>
      </paper-toast>
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
      gettingUser: {
        type: Boolean,
        value: false
      },
      myData: Object,
      user: Object,
      route: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(route.path, user)'
    ];
  }

  ready() {
    super.ready();
    new ScriptLoader([
      "https://www.gstatic.com/firebasejs/5.8.3/firebase-auth.js",
      "https://www.gstatic.com/firebasejs/5.8.3/firebase-database.js",
      "https://www.gstatic.com/firebasejs/5.8.3/firebase-storage.js",
      "node_modules/web-animations-js/web-animations-next-lite.min.js"
    ], function () {
      // Initialize firebase app
      firebase.initializeApp(firebaseDev);
      this.removeAttribute('unresolved');
      this.gettingUser = true;

      firebase.auth().onAuthStateChanged(user => {
        if (user && !user.emailVerified) {
          window.history.pushState({}, null, '/');
          user.sendEmailVerification();
        }

        this.gettingUser = false;
        this.user = user;
      });

      // Initialize event listener
      this.addEventListener('signOut', () => this._signOut());
      this.addEventListener('showLoader', (e) => this._showLoader(e.detail));
      // window event listener
      window.addEventListener('app-update', () => { this.$.toast.open(); });
    }.bind(this));
  }

  _routePageChanged(path, user) {
    if (user) {
      if (user.emailVerified) {
        if (user.phoneNumber) {
          if (!this.myData) {
            this.gettingUser = true;
            firebase.database().ref('/accounts').orderByChild('uid').equalTo(user.uid).on('value', (snapshot) => {
              this.myData = Object.values(snapshot.val())[0];
              this.myData.$key = Object.keys(snapshot.val())[0];
              this.gettingUser = false;

              switch (this.myData.role) {
                case 'System Admin':
                  this._showLoader(true);
                  import('./admin/my-admin.js').then(() => this._showLoader(false));
                  break;
                case 'Doctor':
                  this._showLoader(true);
                  import('./doctor/my-doctor.js').then(() => this._showLoader(false));
                  break;
                case 'Secretary':
                  this._showLoader(true);
                  import('./secretary/my-secretary.js').then(() => this._showLoader(false));
                  break;
              }
            });
          }
        } else {
          this._showLoader(true);
          import('./_main/my-account-link.js').then(() => this._showLoader(false));
        }
      } else {
        this._showLoader(true);
        import('./_main/my-email-verification.js').then(() => this._showLoader(false));
      }
    } else {
      var time = 1;
      if (!path) {
        this._showLoader(true);
        time = 500;
      }

      this._debounceJob = Debouncer.debounce(this._debounceJob,
        timeOut.after(time), () => {
          this._showLoader(false);
          switch (path) {
            case '/sign-in': this.page = "sign-in"; break;
            case '/create-account': this.page = "create-account"; break;
            case '/reset-password': this.page = "reset-password"; break;
            default:
              window.history.pushState({}, null, '/');
              this.page = "sign-in";
          }
        });
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    switch (page) {
      case 'sign-in':
        this._showLoader(true);
        import('./_main/my-sign-in.js').then(() => this._showLoader(false));
        break;
      case 'create-account':
        this._showLoader(true);
        import('./_main/my-create-account.js').then(() => this._showLoader(false));
        break;
      case 'reset-password':
        this._showLoader(true);
        import('./_main/my-reset-password.js').then(() => this._showLoader(false));
        break;
    }
  }

  _signOut() {
    window.history.pushState({}, null, '/');
    window.location.reload();
    firebase.auth().signOut();
  }

  _isEqual(e, f) { return e === f; }
  _showLoader(e) {
    if (e) this.$.overlay.style.display = "flex";
    else this.$.overlay.style.display = "none";
  }
}

window.customElements.define('my-app', MyApp);
