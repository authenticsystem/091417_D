
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { sharedSignInCard } from '../shared-sign-in-card.js';

class MyResetPassword extends PolymerElement {
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
            <div style="margin: 10px 6px;">
                <h1>Reset Password</h1>
                
                <div hidden$="[[isSend]]">
                    <div class="primary-text">Enter your email address and follow the instructions in the email that
                        we will send to you.</div>
                    <div class="error" id="error"></div>
                    <paper-input on-keyup="_onEnter" placeholder="Email" value="{{email}}"></paper-input>
                    <div style="text-align: right; margin-top: -46px;">
                        <a href="[[rootPath]]">
                            <paper-button disabled="[[loading]]" class="secondary">Cancel</paper-button>
                        </a>
                        <paper-button disabled="[[loading]]" id="submitBtn" class="primary" on-tap="_resetPassword">Submit</paper-button>
                    </div>
                </div>

                <div hidden$="[[!isSend]]">
                    <p class="primary-text">Reset password link was sent to <b>[[email]]</b>. Kindly check your email.</p>
                    <div style="text-align: right;">
                        <a href="[[rootPath]]">
                            <paper-button class="secondary">Sign In</paper-button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    static get properties() {
        return {
            isSend: {
                type: Boolean,
                value: false
            }
        };
    }

    _resetPassword() {
        if (this.email) {
            this._toggleBtn(true);
            firebase.auth().sendPasswordResetEmail(this.email).then(() => {
                this._toggleBtn(false);
                this.isSend = true;
            }).catch(error => {
                this._toggleBtn(false);
                switch (error.code) {
                    case 'auth/invalid-email':
                        this.$.error.innerHTML = "Please enter a valid email address!";
                        break;
                    case 'auth/user-not-found':
                        this.$.error.innerHTML = "Sorry! No user found with the corresponding email address.";
                        break;
                }
            });
        } else {
            this.$.error.innerHTML = "Please enter your email address.";
        }
    }

    _onEnter(e) {
        if (e.keyCode === 13) this._resetPassword();
    }

    _toggleBtn(isSigningIn) {
        this.$.submitBtn.classList.toggle("loading");
        this.loading = isSigningIn;

        if (isSigningIn) this.$.submitBtn.innerHTML = "Submitting...";
        else this.$.submitBtn.innerHTML = "Submit";
    }
}

window.customElements.define('my-reset-password', MyResetPassword);
