import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class MySettings extends PolymerElement {
    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display:block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }
            .polymer-card {
                text-align: center;
                margin: 0;
                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
                transition: all .2s ease-in-out;
            }

            .polymer-card:hover {
                cursor: pointer;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            }

            .crafty {
                font-family: 'Crafty Girls', cursive;
                padding: 1rem 1rem 0;
                text-align: center;
                line-height: 1.3;
                letter-spacing: 4px;
                font-size: 1.125em;
            }

            .section-holder { margin: 0 16px 8px; }

            /*  SECTIONS  */
            .section {
                clear: both;
                padding: 0px;
                margin: 0px;
            }

            /*  COLUMN SETUP  */
            .col {
                display: block;
                float:left;
                margin: 1% 0 1% 1%;
            }
            .col:first-child { margin-left: 0; }

            /*  GROUPING  */
            .group:before,
            .group:after { content:""; display:table; }
            .group:after { clear:both;}
            .group { zoom:1; /* For IE 6/7 */ }
            /*  GRID OF THREE  */
            .col-3 { width: 100%; }
            .col-2 { width: 66.33%; }
            .col-1 { width: 32.66%; }

            /*  GO FULL WIDTH BELOW 480 PIXELS */
            @media only screen and (max-width: 480px) {
                .section-holder { margin: 8px; }
                .col {  margin: 1% 0 1% 0%; }
                .col-3, .col-2, .col-1 { width: 100%; }
            }  

            @media only screen and (min-width: 480px) {
                .x { margin-top: 0px; }
            }    
        </style>
      
        <app-route route="{{route}}" pattern="/account" active="{{accountActive}}"></app-route>
        <app-route route="{{route}}" pattern="/secretary" active="{{secretaryActive}}"></app-route>
        <app-route route="{{route}}" pattern="/services" active="{{servicesActive}}"></app-route>
        <app-route route="{{route}}" pattern="/hmo" active="{{hmoActive}}"></app-route>

        <iron-pages attr-for-selected="name" selected="[[route.path]]" fallback-selection="view404">
            <div name="">
                <app-header-layout fullbleed="" has-scrolling-region="">
                    <app-header fixed="" slot="header">
                        <app-toolbar primary="">
                            <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                            <div main-title="">Settings</div>
                        </app-toolbar>
                    </app-header>

                    <div class="section-holder">
                        <div class="section group">
                            <div class="col col-1">
                                <a href="/settings/account">
                                    <div class="polymer-card">
                                        <iron-image preload="" fade="" sizing="contain" style="width:100px; height:100px; border-radius:50%;" src="../images/user.png"></iron-image>
                                        <div class="crafty"><p class="ellipsis">My Account</p></div> 
                                    </div>
                                </a>
                            </div>
                            <div class="col col-1">
                                <a href="/settings/secretary">
                                    <div class="polymer-card">
                                        <iron-image preload="" fade="" sizing="contain" style="width:100px; height:100px; border-radius:50%;" src="../images/secretary.png"></iron-image>
                                        <div class="crafty"><p class="ellipsis">My Secretary</p></div> 
                                    </div>
                                </a>
                            </div>
                            <div class="col col-1">
                                <a href="/settings/services">
                                    <div class="polymer-card">
                                        <iron-image preload="" fade="" sizing="contain" style="width:100px; height:100px; border-radius:50%;" src="../images/services.png"></iron-image>
                                        <div class="crafty"><p class="ellipsis">My Services</p></div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div class="section group">
                            <div class="col col-1 x">
                                <a href="/settings/hmo">
                                    <div class="polymer-card">
                                        <iron-image preload="" fade="" sizing="contain" style="width:100px; height:100px; border-radius:50%;" src="../images/hmo.png"></iron-image>
                                        <div class="crafty"><p class="ellipsis">My HMO</p></div> 
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </app-header-layout>
            </div>

            <div name="/account">
                <template is="dom-if" if="[[accountActive]]" restamp="">
                    <user-account user="[[user]]" my-data="[[myData]]"></user-account>
                </template>
            </div>

            <div name="/secretary">
                <template is="dom-if" if="[[secretaryActive]]" restamp="">
                    <my-secretary my-data="[[myData]]"></my-secretary>
                </template>
            </div>

            <div name="/services">
                <template is="dom-if" if="[[servicesActive]]" restamp="">
                    <my-services my-data="[[myData]]"></my-services>
                </template>
            </div>

            <div name="/hmo">
                <template is="dom-if" if="[[hmoActive]]" restamp="">
                    <my-hmo my-data="[[myData]]"></my-hmo>
                </template>
            </div>

            <div name="view404">
                <div style="padding: 16px;">
                    Oops you hit a 404. <a href="/settings">Head back to settings.</a>
                </div>
            </div>
        </iron-pages>
      `;
    }

    static get properties() {
        return {
            user: Object,
            myData: Object,
            route: Object
        };
    }

    static get observers() {
        return [
            '_routePageChanged(route.path)'
        ];
    }

    _routePageChanged(page) {
        switch (page) {
            case '/account':
                this._showLoader(true);
                import('../_elements/user-account.js').then(() => this._showLoader(false));
                break;
            case '/secretary':
                this._showLoader(true);
                import('./my-secretary.js').then(() => this._showLoader(false));
                break;
            case '/services':
                this._showLoader(true);
                import('./my-services.js').then(() => this._showLoader(false));
                break;
            case '/hmo':
                this._showLoader(true);
                import('./my-hmo.js').then(() => this._showLoader(false));
                break;
        }
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }

    _showLoader(show) {
        this.dispatchEvent(new CustomEvent('showLoader', {
            bubbles: true, composed: true, detail: show
        }));
    }
}

window.customElements.define('my-settings', MySettings);