
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { sharedSignInCard } from '../shared-sign-in-card.js';

class MySignIn extends PolymerElement {
    static get template() {
        return html`
        ${sharedSignInCard}
        <style include="shared-styles">
            :host {
                display:block;
            }
        </style>

        <div class="sign-in-card">
            <img src="images/manifest/icon-512x512.png" width="100" height="100">
            <iron-form id="form" style="margin: 0 6px;">
             <form>
                <h1>Sign In</h1>
                <span class="error" id="error"></span>
                <paper-input required on-keyup="_onEnter" placeholder="Email" value="{{email}}"></paper-input>
                <paper-input required on-keyup="_onEnter" placeholder="Password" type="password" value="{{password}}"></paper-input>
                <div class="primary-text" style="margin-top: 18px;">
                    <span>No account?</span> 
                    <a href="/create-account">Create one!</a>
                </div>
                <div style="text-align: right;">
                    <paper-button id="signBtn" style="margin-top: 30px;" class="primary" on-tap="_signIn">Sign In</paper-button>
                </div>
             </form>
            </iron-form>
        </div>
    `;
    }

    _signIn() {
        if (this.$.form.validate()) {
            this._toggleBtn(true);
            const _$ = this;
            firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(function (response) {
                _$._toggleBtn(false);
            }).catch(function (error) {
                _$._toggleBtn(false);
                _$.$.error.innerHTML = "Your email or password is incorrect. If you don't remember it, <a href='/reset-password'>reset it now.</a>";
                console.clear();
            });
        } else {
            this.$.error.innerHTML = "Please enter your email and password.";
        }
    }

    _onEnter(e) {
        if (e.keyCode === 13) {
            this._signIn();
        }
    }

    _toggleBtn(isSigningIn) {
        this.$.signBtn.classList.toggle("loading");
        this.loading = isSigningIn;

        if (isSigningIn) {
            this.$.signBtn.innerHTML = "Signing in...";
            this.$.signBtn.disabled = true;
        } else {
            this.$.signBtn.innerHTML = "Sign In";
            this.$.signBtn.disabled = false;
        }
    }
}

window.customElements.define('my-sign-in', MySignIn);
