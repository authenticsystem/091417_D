
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { sharedSignInCard } from '../shared-sign-in-card.js';

class MyAccountLink extends PolymerElement {
    static get template() {
        return html`
        ${sharedSignInCard}
        <style include="shared-styles">
            :host { display:block; }
            .error { margin-top: 8px; }
        </style>

        <div class="sign-in-card">
            <img src="images/manifest/icon-512x512.png" width="100" height="100">

            <iron-pages attr-for-selected="name" selected="{{selectedPage}}">
                <div name="account" style="margin: 10px 6px;">
                    <h1>Account Setup</h1>
                    <div class="primary-text">
                        Email <b>[[user.email]]</b> has been verified. <br/>
                        Please enter your account code to finish setting-up your account.
                    </div>

                    <paper-input on-keyup="_onEnter" placeholder="Account Code" value="{{accountCode}}"></paper-input>
                    <div class="primary-text" style="margin-top: 16px;">
                        <span>Don't have an account code?</span> 
                        <a href="https://www.baseph.com/" target="_blank">Contact us.</a>
                    </div>

                    <div style="text-align: right; margin-top: -20px;">
                        <paper-button disabled="[[loading]]" class="secondary" on-tap="_signOut">Sign Out</paper-button>
                        <paper-button disabled="[[loading]]" id="accountBtn" class="primary" on-tap="_sendPhoneCode">Next</paper-button>
                    </div>
                </div>

                <div name="phone" style="margin: 10px 6px;">
                    <h1>Verify if it is you</h1>
                    <div class="primary-text">
                        Please enter the verification code that was sent on your mobile device with a phone number <b>[[phone]]</b>.
                    </div>
                    <paper-input on-keyup="_onEnter" placeholder="Verification Code" value="{{phoneCode}}"></paper-input>
                    <div style="text-align: right; margin-top: -36px;">
                        <paper-button id="phoneBtn" class="primary" on-tap="_verifyPhoneCode">Verify</paper-button>
                    </div>
                </div>

                <div name="success" style="margin: 10px 6px;">
                    <iron-form id="form">
                        <form>
                            <h1>Yey! Your all set.</h1>
                            <div class="primary-text">Your account has been set and activated. <br> Thank you for joining BaseEMR.</div>
                            <div style="text-align: right; margin-top: -26px;">
                                <paper-button class="primary" on-tap="_reload">Sign In</paper-button>
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
                value: "account"
            }
        };
    }

    _signOut() {
        window.history.pushState({}, null, '/');
        window.location.reload();
        firebase.auth().signOut();
    }

    _sendPhoneCode() {
        if (this.accountCode) {
            this._toggleBtn(true);
            firebase.database().ref('/accounts').orderByChild('code').equalTo(this.accountCode).once('value').then(snapshot => {
                this._toggleBtn(false);
                if (snapshot.exists()) {
                    this.myData = Object.values(snapshot.val())[0];
                    this.myData.$key = Object.keys(snapshot.val())[0];
                    this.phone = "+63" + this.myData.cellphone;
                    this.signInWithPhone();
                } else {
                    alert("Sorry! Your account code is invalid.\nIf you don't have one, contact us.")
                }
            });
        }
    }

    signInWithPhone() {
        this._toggleBtn(true);
        this._removeRecaptcha();
        const recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptchaContainer';
        document.body.appendChild(recaptchaContainer);

        if (!recaptchaContainer) {
            alert('Invalid recaptcha-container');
            return;
        }

        const appVerifier = new firebase.auth.RecaptchaVerifier(
            recaptchaContainer,
            { size: 'invisible' }
        );

        firebase.auth().signInWithPhoneNumber(this.phone, appVerifier).then(confirmationResult => {
            /**
             * SMS sent. Prompt user to type the code
             * from the message, then sign the user in
             * with confirmationResult.confirm(code).
             */
            this._toggleBtn(false);
            this.selectedPage = "phone";
            this.confirmationResult = confirmationResult;
            this._removeRecaptcha();
        }).catch(error => {
            this._toggleBtn(false);
            this._removeRecaptcha();
        });
    }

    _removeRecaptcha() {
        const element = document.getElementById('recaptchaContainer');
        if (!element) return;
        element.remove();
    }

    _verifyPhoneCode() {
        if (this.phoneCode) {
            this._toggleBtn(true);
            const credential = firebase.auth.PhoneAuthProvider.credential(this.confirmationResult.verificationId, this.phoneCode);
            firebase.auth().currentUser.linkAndRetrieveDataWithCredential(credential).then(userCred => {
                userCred.user.updateProfile({ displayName: this.myData.name.firstname + ' ' + this.myData.name.middlename + ' ' + this.myData.name.lastname + ' ' + this.myData.name.suffix });
                firebase.database().ref('/accounts/' + this.myData.$key).update({ uid: userCred.user.uid, active: true });
                this._toggleBtn(false);
                this.selectedPage = "success";
            }).catch(error => {
                this._toggleBtn(false);
                alert(error.message);
            });
        }
    }

    _reload() { window.location.reload(); }
    _onEnter(e) {
        if (e.keyCode === 13) {
            if (this.selectedPage === "account") this._sendPhoneCode();
            if (this.selectedPage === "phone") this._verifyPhoneCode();
        }
    }

    _toggleBtn(isSigningIn) {
        this.loading = isSigningIn;
        if (this.selectedPage === "account") {
            this.$.accountBtn.classList.toggle("loading");
            if (isSigningIn) this.$.accountBtn.innerHTML = "Hang on...";
            else this.$.accountBtn.innerHTML = "Next";
        }

        if (this.selectedPage === "phone") {
            this.$.phoneBtn.classList.toggle("loading");
            if (isSigningIn) this.$.phoneBtn.innerHTML = "Verifying...";
            else this.$.phoneBtn.innerHTML = "Verify";
        }
    }
}

window.customElements.define('my-account-link', MyAccountLink);
