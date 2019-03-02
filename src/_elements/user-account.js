import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import Compressor from 'compressorjs';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-dialog/paper-dialog.js';

class UserAccount extends PolymerElement {
    constructor() {
        super();
        this.selectedPage = "";
        this.isAuthLoading = false;
        this.fileText = "Change profile picture";
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host {
                display:block;
            }

            a { color: #fff; }
            a:hover { color: #fff; }

            @media (max-width: 768px) {
                .divHolder { display: block; }
                .div1 { text-align: center; }
                paper-menu-button {
                    float: right;
                    bottom: 16px;
                }
            }

            @media (min-width: 768px) {
                .divHolder { display: flex; }
                .div1 { flex: 1; }
                .div2 {
                    flex: 2;
                    padding: 25px;
                }
                paper-menu-button {
                    float: right;
                    bottom: 26px;
                }
            }
        </style>

        <app-header-layout fullbleed="" has-scrolling-region="">
            <app-header fixed="" slot="header">
                <app-toolbar primary="">
                    <paper-icon-button hidden="[[_isEqual(myData.role, 'Doctor')]]" class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                    <a hidden="[[!_isEqual(myData.role, 'Doctor')]]" href="/settings">
                        <paper-icon-button class="main" icon="my-icons:arrow-back"></paper-icon-button>
                    </a>
                    <div main-title="">My Account</div>
                </app-toolbar>
            </app-header>

            <div class="polymer-card">
                <div class="divHolder">
                    <div class="div1">
                        <iron-image preload="" fade="" sizing="cover" placeholder="../../images/user.png" style="width:200px; height:200px; border-radius:50%;" src\$="[[_src(user.photoURL)]]"></iron-image>
                        <div class="upload-btn-wrapper">
                            <button class="btn">[[fileText]]</button>
                            <input on-change="_upload" type="file" name="myfile" id="fileButton" accept="image/*">
                        </div>
                    </div>
                    <div class="div2">
                        <iron-pages attr-for-selected="name" selected="[[selectedPage]]">
                            <div name="">
                                <paper-menu-button horizontal-align="right">
                                    <paper-icon-button title="More options" icon="my-icons:expand-more" slot="dropdown-trigger" alt="menu"></paper-icon-button>
                                    <paper-listbox style="cursor:pointer" slot="dropdown-content">
                                        <paper-item on-tap="_pageChangeEmail">Change email</paper-item>
                                        <paper-item on-tap="_pageChangePassword">Change password</paper-item>
                                    </paper-listbox>
                                </paper-menu-button>
                                <paper-input label="Name" readonly="" value="[[user.displayName]]"></paper-input>
                                <paper-input label="Email" readonly="" value="[[user.email]]"></paper-input>
                            </div>

                            <div name="changeEmail">
                                <paper-input style="margin-top: 26px;" required label="New email" value="{{email}}"></paper-input>                   
                                <div style="text-align: right; margin-top: 8px;">
                                    <paper-button class="primary" style="margin-top: 0;" on-tap="_validateEmail">Next</paper-button>
                                    <paper-button class="secondary" style="margin-top: 0;" on-tap="_pageCancel">Cancel</paper-button>
                                </div>
                            </div>

                            <div name="changePassword">
                                <paper-input label="New password" type="password" value="{{password}}"></paper-input>
                                <paper-input label="Confirm password" type="password" value="{{confirmPassword}}"></paper-input>
                                <div style="text-align: right; margin-top: 8px;">
                                    <paper-button class="primary" style="margin-top: 0;" on-tap="_validatePassword">Next</paper-button>
                                    <paper-button class="secondary" style="margin-top: 0;" on-tap="_pageCancel">Cancel</paper-button>
                                </div>
                            </div>
                        </iron-pages>
                    </div>
                </div>
            </div>
        </app-header-layout>

        <paper-dialog style="width: 476px;" modal id="dialog">
            <h2 style="background: #4285f4; margin: 0; color: #fff; padding: 16px; font-weight: 400; font-size: 16px;">Re-authentication required</h2>
            <div>
                <iron-form id="form">
                    <form>
                        <paper-input disabled="[[isAuthLoading]]" style="margin-top: 6px;" required error-message="Email is required!" on-keyup="_onEnter" label="Email" value="{{authEmail}}" always-float-label></paper-input>
                        <paper-input disabled="[[isAuthLoading]]" style="margin-top: 6px;" required error-message="Password is required!" on-keyup="_onEnter" label="Password" value="{{authPassword}}" always-float-label type="password"></paper-input>
                    </form>
                </iron-form>
            </div>
            <div class="buttons" style="padding:16px;">
                <paper-button disabled="[[isAuthLoading]]" style="font-size: 14px; border-radius: 0; background-color:  var(--paper-blue-800); color: white; padding: 8px 36px; text-transform: none;" on-tap="_submit">Submit</paper-button>
                <paper-button disabled="[[isAuthLoading]]" style="font-size: 14px; border-radius: 0; background-color: #d9d9d9; color: black; padding: 8px 36px; text-transform: none;" dialog-dismiss>Cancel</paper-button>
            </div>
        </paper-dialog>
        `;
    }

    static get properties() {
        return {
            user: Object,
            myData: Object
        };
    }

    _upload(e) {
        const _$ = this;
        const file = e.target.files[0];
        const user = this.user;
        if (file) {
            this.fileText = "Uploading profile...";
            new Compressor(file, {
                quality: 0.8,
                width: 440,
                height: 400,
                success(result) {
                    const name = new Date().getTime() + "." + result.name;
                    firebase.storage().ref('profilePicture/' + name).put(result).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
                        if (user.photoURL) firebase.storage().refFromURL(user.photoURL).delete();
                        user.updateProfile({ photoURL: url }).then(function () { window.location.reload() });
                    });
                },
                error(err) {
                    alert("Error while uploading image! Please try again.");
                },
            });
        }
    }

    _src(e) {
        if (e) return e;
        return '../../images/user.png';
    }

    _validateEmail() {
        if (!this.email) return alert("Please enter an email address!");
        var atpos = this.email.indexOf("@");
        var dotpos = this.email.lastIndexOf(".");
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= this.email.length) return alert("Please enter a valid email address!");
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _validatePassword() {
        if (!this.password) return alert("Please enter your new password!");
        if (this.password.length < 6) return alert("Password must be greater than or equal to six.");
        if (!this.confirmPassword) return alert("Please confirm your password.");
        if (this.confirmPassword !== this.password) return alert("Password do not match! Please confirm it.");
        document.body.appendChild(this.$.dialog);
        this.$.dialog.open();
    }

    _submit() {
        if (this.$.form.validate()) {
            this.isAuthLoading = true;
            const credential = firebase.auth.EmailAuthProvider.credential(this.authEmail, this.authPassword);
            this.user.reauthenticateAndRetrieveDataWithCredential(credential).then(function () {
                if (this.selectedPage === "changeEmail") {
                    this.user.updateEmail(this.email).then(function () {
                        this.isAuthLoading = false;
                        alert("Email address successfully changed.");
                        window.location.reload();
                    }.bind(this));
                } else if (this.selectedPage === "changePassword") {
                    this.user.updatePassword(this.password).then(function () {
                        this.isAuthLoading = false;
                        alert("Password successfully changed.");
                        window.location.reload();
                    }.bind(this));
                }
            }.bind(this)).catch(function (error) {
                this.isAuthLoading = false;
                alert("Your email or password is incorrect.");
            }.bind(this));
        }
    }

    _isEqual(e, f) { return e === f; }
    _onEnter(e) { if (e.keyCode === 13) this._submit(); }
    _pageChangeEmail() { this.selectedPage = "changeEmail"; }
    _pageChangePassword() { this.selectedPage = "changePassword"; }
    _pageCancel() {
        this.selectedPage = "";
        this.email = null;
        this.password = null;
        this.confirmPassword = null;
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }
}

window.customElements.define('user-account', UserAccount);