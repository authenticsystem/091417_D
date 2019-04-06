import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-image/iron-image.js';

class MyAdmin extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display:block;
        }

        .content-list {
          overflow: hidden;
        }

        .top {
          height: calc(100vh - 19.3em);
          overflow: auto;
        }

        .bottom {
          position: absolute;
          bottom: 165px;
          left: 0;
          right: 0;
          background: #fff;
          padding-bottom: 6px;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
          <app-toolbar class="main-toolbar"> 
            <div on-tap="_myAccount" class="avatar-container" top-item>
              <iron-image preload="" fade="" sizing="cover" placeholder="../../images/user.png" class="image" src\$="[[_src(user.photoURL)]]"></iron-image>
            </div>
            <div class="contact-info" bottom-item	>
              <div class="name" hidden="[[user.displayName]]">[[user.email]]</div>
              <div class="name" hidden="[[!user.displayName]]">[[user.displayName]]</div>
              <div class="email">[[myData.designatory]]</div>
            </div>
          </app-toolbar>
          
          <div class="content-list">
            <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
              <div class="top">
                <a name="users" href="[[rootPath]]">
                  <paper-icon-item toggles="true" class="menuSelected">
                    <iron-icon icon="my-icons:people" slot="item-icon"></iron-icon>
                    <span>Users</span>
                  </paper-icon-item>
                </a>

                <a name="new-user" href="[[rootPath]]new-user">
                  <paper-icon-item toggles="true" class="menuSelected">
                    <iron-icon icon="my-icons:person-add" slot="item-icon"></iron-icon>
                    <span>New User</span>
                  </paper-icon-item>
                </a>
              </div>

              <div class="bottom">
                <div class="breaker" style="width:94%; margin-top: 0;"></div>
                <a on-tap="_signOut">
                  <paper-icon-item toggles="true" class="menuSelected">
                    <iron-icon icon="my-icons:power-settings-new" slot="item-icon"></iron-icon>
                    <span>Sign Out</span>
                  </paper-icon-item>
                </a>
              </div>
            </iron-selector>
          </div>

          <footer>
            Copyright © 2019 BaseEMR v1.0.0
          </footer>
        </app-drawer>

        <!-- Main content -->
        <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
          <my-users name="users"></my-users>
          <my-new-user name="new-user"></my-new-user>
          <user-account name="account" user="[[user]]" my-data="[[myData]]"></user-account>
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
      user: Object,
      myData: Object,
      routeData: Object,
      subroute: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  ready() {
    super.ready();
    this.addEventListener('toggleDrawer', () => this._toggleDrawer());
  }

  _routePageChanged(page) {
    if (!page) {
      this.page = 'users';
    } else if (['users', 'new-user', 'account'].indexOf(page) !== -1) {
      this.page = page;
    } else {
      this.page = 'view404';
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _pageChanged(page) {
    switch (page) {
      case 'users':
        this._showLoader(true);
        import('./my-users.js').then(() => this._showLoader(false));
        break;
      case 'new-user':
        this._showLoader(true);
        import('./my-new-user.js').then(() => this._showLoader(false));
        break;
      case 'account':
        this._showLoader(true);
        import('../_elements/user-account.js').then(() => this._showLoader(false));
        break;
      case 'view404':
        import('../_main/my-view404.js');
        break;
    }
  }

  _myAccount() {
    window.history.pushState({}, null, '/account');
    window.dispatchEvent(new CustomEvent('location-changed'));
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

window.customElements.define('my-admin', MyAdmin);