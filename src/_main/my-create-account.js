
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { sharedSignInCard } from '../shared-sign-in-card.js';

class MyCreateAccount extends PolymerElement {
    static get template() {
        return html`
        ${sharedSignInCard}
        <style include="shared-styles">
            :host { display:block; }
            .error { margin-top: 8px; }
        </style>

        <div class="sign-in-card">
            <img src="images/manifest/icon-512x512.png" width="100" height="100">
            <iron-form id="form" style="margin: 10px 6px;">
             <form>
                <h1>Create Account</h1>
                <span class="error" id="error"></span>
                <paper-input on-keyup="_onEnter" required placeholder="Email" value="{{email}}"></paper-input>
                <paper-input on-keyup="_onEnter" required placeholder="Password" type="password" value="{{password}}"></paper-input>
                <paper-input on-keyup="_onEnter" required placeholder="Confirm password" type="password" value="{{confirmPassword}}"></paper-input>
                <div style="text-align: right; margin-top: -26px;">
                    <a href="[[rootPath]]">
                        <paper-button disabled="[[loading]]" class="secondary">Cancel</paper-button>
                    </a>
                    <paper-button disabled="[[loading]]" id="registerBtn" class="primary" on-tap="_createAccount">Next</paper-button>
                </div>
             </form>
            </iron-form>
        </div>
    `;
    }

    _createAccount() {
        if (this.$.form.validate()) {
            var atpos = this.email.indexOf("@");
            var dotpos = this.email.lastIndexOf(".");
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= this.email.length) {
                this.$.error.innerHTML = "Please enter a valid email address.";
            }
            else if (this.password.length < 6) {
                this.$.error.innerHTML = "Your password must be greater than or equal to six.";
            }
            else if (this.password !== this.confirmPassword) {
                this.$.error.innerHTML = "Your password do not match.";
            } else {
                this.$.error.innerHTML = null;
                this._toggleBtn(true);
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password).catch(function (error) {
                    if (error.code === "auth/email-already-in-use") this.$.error.innerHTML = 'Email address is already in use! Please use another email.';
                    else this.$.error.innerHTML = error.message;
                    this._toggleBtn(false);
                }.bind(this));
            }
        } else {
            this.$.error.innerHTML = "Please don't leave any field empty.";
        }
    }

    _onEnter(e) {
        if (e.keyCode === 13) {
            this._createAccount();
        }
    }

    _toggleBtn(isSigningIn) {
        this.$.registerBtn.classList.toggle("loading");
        this.loading = isSigningIn;

        if (isSigningIn) this.$.registerBtn.innerHTML = "Registering...";
        else this.$.registerBtn.innerHTML = "Next";
    }
}

window.customElements.define('my-create-account', MyCreateAccount);
