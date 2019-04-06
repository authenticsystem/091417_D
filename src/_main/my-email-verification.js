
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { sharedSignInCard } from '../shared-sign-in-card.js';

class MyEmailVerification extends PolymerElement {
    static get template() {
        return html`
        ${sharedSignInCard}
        <style include="shared-styles">
            :host {
                display:block;
            }

            .error {
                margin-top: 8px;
            }
        </style>

        <div class="sign-in-card">
            <img src="images/manifest/icon-512x512.png" width="100" height="100">

            <iron-pages attr-for-selected="name" selected="{{selectedPage}}">
                <div name="verify" style="margin: 10px 6px;">
                    <h1>Email not yet verify</h1>
                    <div class="primary-text">
                        Let us know if this email belongs to you.<br/>
                        Click the link in the email sent to <b>[[user.email]].</b><br/><br/>
                        
                        If you already done so, click <b>Next.</b><br/>
                        If you haven't receive any email just click <b>Resend.</b><br/><br/>
                        
                        Not your email address? <a on-tap="_changeEmail">Change email!</a><br/>
                        Or would you prefer to just, <a on-tap="_signOut">Sign out!</a>
                    </div>
                    
                    <div style="text-align: right; margin-top: -26px;">
                        <paper-button disabled="[[resendLoading]]" id="resend" class="secondary" on-tap="_resend">Resend</paper-button>
                        <paper-button disabled="[[resendLoading]]" class="primary" on-tap="_reload">Next</paper-button>
                    </div>
                </div>

                <div name="change" style="margin: 10px 6px;">
                    <h1>Change email [[user.email]]</h1>
                    <paper-input on-keyup="_onEnter" placeholder="New email address" value="{{email}}"></paper-input>
                    <div style="text-align: right; margin-top: -36px;">
                        <paper-button class="secondary" on-tap="_cancel">Cancel</paper-button>
                        <paper-button class="primary" on-tap="_validateEmail">Next</paper-button>
                    </div>
                </div>

                <div name="re" style="margin: 10px 6px;">
                    <iron-form id="form">
                        <form>
                            <h1>Re-authentication required</h1>
                            <div class="primary-text">Enter your signed email address and password to continue.</div>
                            <paper-input disabled="[[isAuthLoading]]" on-keyup="_onAuth" placeholder="Signed Email" value="{{authEmail}}" required></paper-input>
                            <paper-input disabled="[[isAuthLoading]]" on-keyup="_onAuth" placeholder="Password" type="password" value="{{authPassword}}" required></paper-input>
                            <div style="text-align: right; margin-top: -26px;">
                                <paper-button disabled="[[isAuthLoading]]" class="secondary" on-tap="_cancel">Cancel</paper-button>
                                <paper-button disabled="[[isAuthLoading]]" class="primary" on-tap="_submit">Next</paper-button>
                            </div>
                        </form>
                    </iron-form>
                </div>
            </iron-pages>
        </div>
    `;
    }

    static get properties() {
        return {
            user: Object,
            selectedPage: {
                type: String,
                value: "verify"
            }
        };
    }

    static get observers() {
        return [];
    }

    _resend() {
        this.$.resend.innerHTML = "Sending...";
        this.resendLoading = true;
        this.user.sendEmailVerification().then(function () {
            this.$.resend.innerHTML = "Resend";
            this.resendLoading = false;
            alert("Email verification had been successfully resend!\nKindly check your inbox or look in the spam.");
        }.bind(this));
    }

    _signOut() {
        window.history.pushState({}, null, '/');
        window.location.reload();
        firebase.auth().signOut();
    }

    _changeEmail() { this.selectedPage = "change"; }
    _reload() { window.location.reload(); }

    _cancel() {
        if (this.selectedPage === "change") {
            this.email = null;
            this.selectedPage = "verify";
        }
        if (this.selectedPage === "re") {
            this.$.form.reset();
            this.selectedPage = "change";
        }
    }

    _validateEmail() {
        if (!this.email) return alert("Please enter an email address!");
        var atpos = this.email.indexOf("@");
        var dotpos = this.email.lastIndexOf(".");
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= this.email.length) return alert("Please enter a valid email address!");
        this.selectedPage = "re";
    }

    _submit() {
        if (this.$.form.validate()) {
            this.isAuthLoading = true;
            const credential = firebase.auth.EmailAuthProvider.credential(this.authEmail, this.authPassword);
            this.user.reauthenticateAndRetrieveDataWithCredential(credential).then(function () {
                this.user.updateEmail(this.email).then(function () {
                    this.isAuthLoading = false;
                    alert("Email address successfully changed.");
                    window.location.reload();
                }.bind(this));
            }.bind(this)).catch(function (error) {
                this.isAuthLoading = false;
                alert("Your email or password is incorrect.");
            }.bind(this));
        }
    }

    _onEnter(e) { if (e.keyCode === 13) this._validateEmail(); }
    _onAuth(e) { if (e.keyCode === 13) this._submit(); }
}

window.customElements.define('my-email-verification', MyEmailVerification);
