import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { messagingStyles } from '../shared-styles2.js';
import { fbSnapshotToArray, chatTimeAndDate, smooth_scroll_to } from 'g-element/src/sharedFunctions.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-item/paper-item-body.js';
import 'g-element/elements/g-avatar.js';

class MyMessaging extends PolymerElement {
    constructor() {
        super();
        this.msg = "";
        fetch('/src/_data/emoji.json').then(response => { return response.json(); }).then(data => {
            this.emojiItems = data;
        });
    }

    static get template() {
        return html`
        <style include="shared-styles">
            :host { display: block; }
            app-drawer-layout:not([narrow]) [drawer-toggle] { display: none; }
            paper-icon-item {
                padding: 0 8px;
                border-bottom: 1px solid #ddd;
                transition: all .2s ease-in-out;
            }

            paper-icon-item:hover {
                opacity: 0.6;
                cursor: pointer;
            }

            paper-icon-button.send {  color: black; }
            paper-icon-button.send[disabled] { color: var(--disabled-text-color); }
        </style>
        ${messagingStyles}

        <app-drawer-layout fullbleed="" narrow="{{narrow}}" id="drawerLayout">
            <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]" align="right">
                <div class="item-header">
                    <b>My Contact's</b>
                </div>
                <paper-listbox class="mnu" selected="{{selectedContact}}" attr-for-selected="name">
                    <template is="dom-repeat" items="[[myDoctors]]">
                        <paper-icon-item style="text-align:left;" name="[[item.code]]~[[item.lastname]]">
                            <g-avatar label="[[item.lastname]]" slot="item-icon"></g-avatar>
                            <paper-item-body two-line="">
                                <div class="primary-text">Dr. [[item.lastname]]</div>
                                <div secondary="" class="long-text">[[_msg(item.lastMsg)]]</div>
                            </paper-item-body>
                        </paper-icon-item>
                    </template>
                </paper-listbox>
            </app-drawer>

            <app-header-layout fullbleed="" has-scrolling-region="">
                <app-header fixed="" slot="header">
                    <app-toolbar primary="">
                        <paper-icon-button class="main" icon="my-icons:menu" on-tap="_toggleDrawer"></paper-icon-button>
                        <div main-title="">Messaging</div>
                        <paper-icon-button class="main" icon="my-icons:contacts" drawer-toggle=""></paper-icon-button>
                    </app-toolbar>
                </app-header>

                <div class="content" id="messageHolder">
                    <template is="dom-repeat" items="[[myMessages]]">
                        <template is="dom-if" if="[[_ifIncomingMsg(item.sender)]]">
                            <div class="incoming_msg">
                                <g-avatar label="[[selectedContactName]]" class="incoming_msg_img"></g-avatar>
                                <div class="received_msg">
                                    <div class="received_withd_msg">
                                        <p>[[item.message]]</p>
                                        <span class="time_date">[[_chatTimeAndDate(item.time)]]</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template is="dom-if" if="[[_ifOutgoingMsg(item.sender)]]">
                            <div class="outgoing_msg">
                                <div class="sent_msg">
                                    <p>[[item.message]]</p>
                                    <span class="time_date">[[_chatTimeAndDate(item.time)]]</span>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>

                <footer>
                    <div style="display: flex;">
                        <paper-icon-button noink="" class\$="[[_checkCollapseActive(emojiOpen)]]" on-tap="_showEmoji" icon="my-icons:insert-emoticon"></paper-icon-button>
                        <paper-textarea id="msgValue" max-rows="2" on-keypress="_onKeypressTextarea" class="textarea" value="{{msg}}" placeholder="Type a message..." focused="{{textareIsFocus}}"></paper-textarea>
                        <paper-icon-button noink="" class="send" disabled="[[!msg]]" on-tap="_sendMsg" icon="my-icons:send"></paper-icon-button>
                    </div>
                    <iron-collapse id="collapse" opened="{{emojiOpen}}">
                        <div style="margin: 0 6px 6px 6px; cursor: default;">
                            <template id="emojiList" is="dom-repeat" items="[[emojiItems]]">
                                <span on-tap="_selectEmoji" class="emoji">[[item]]</span>
                            </template>
                        </div>
                    </iron-collapse>
                </footer>
            </app-header-layout>
        </app-drawer-layout>
      `;
    }

    static get properties() {
        return {
            myDoctors: Array,
            myData: Object
        };
    }

    static get observers() {
        return [
            '_selectedContactChanged(selectedContact)',
            '_textareIsFocusChanged(textareIsFocus)',
            '_myDoctorsChanged(myDoctors)'
        ];
    }

    _myDoctorsChanged(doctors) {
        if (doctors && doctors.length > 0) this.selectedContact = doctors[0].code + '~' + doctors[0].lastname;
    }

    _selectedContactChanged(contact) {
        var [selectedContactCode, selectedContactName] = contact.split('~');

        this._debounceJob = Debouncer.debounce(this._debounceJob, timeOut.after(500), () => {
            this.myMessages = [];
            this.selectedContactName = selectedContactName;
            this.selectedContactCode = selectedContactCode;

            firebase.database().ref(`/${this.myData.code}/messages/${selectedContactCode}`).limitToLast(15).on('value', function (snapshot) {
                if (snapshot.exists()) {
                    this.myMessages = fbSnapshotToArray(snapshot);
                    if (this.myMessages.length > 0) {
                        setTimeout((e) => {
                            smooth_scroll_to(this.$.messageHolder, this.$.messageHolder.scrollHeight - this.$.messageHolder.clientHeight, 100);
                        }, 300);
                    }
                }
            }.bind(this));
        });

        this._msgReset(selectedContactCode);
        if (!this.$.drawer.persistent) {
            this.$.drawer.close();
        }
    }

    _onKeypressTextarea(e) {
        if (e.which == 13 && !e.shiftKey) {
            this._sendMsg();
            e.preventDefault();
        }
    }

    _sendMsg() {
        if (this.msg && this.selectedContact) {
            var msg = this.msg;
            var push = firebase.database().ref("/" + this.myData.code + "/messages/" + this.selectedContactCode).push({
                time: firebase.database.ServerValue.TIMESTAMP,
                message: msg,
                sender: this.myData.code,
                sender_name: this.selectedContactName
            });

            if (push.key) {
                var ref = firebase.database().ref("/" + this.selectedContactCode + "/secretary");
                ref.orderByChild("code").equalTo(this.myData.code).once("value").then(function (data) {
                    if (data.exists()) {
                        ref.child(Object.keys(data.val())[0]).update({ lastMsg: msg });
                        firebase.database().ref('/' + this.selectedContactCode + '/uniqueId/msg').transaction(qty => qty = qty + 1).then(() => { });
                    }
                }.bind(this));
                this.msg = '';
            }
        }
    }

    _textareIsFocusChanged(e) {
        if (e) this._msgReset(this.selectedContactCode);
    }

    _checkCollapseActive(e) {
        if (e) return 'emoticon_active';
        else return 'emoticon_not_active';
    }

    _showEmoji() {
        this.$.collapse.toggle();
    }

    _selectEmoji(e) {
        var selectedImoji = this.$.emojiList.itemForElement(e.target);
        var msg = this.msg ? this.msg : '';
        this.msg = msg + selectedImoji;
        this.$.msgValue.focus();
        this._showEmoji();
    }

    _chatTimeAndDate(e) {
        var date = new Date(e);
        return chatTimeAndDate(date);
    }

    _msg(e) {
        if (e) {
            if (e.length > 26) return e.toString().slice(0, 26) + "...";
            else return e;
        }
    }

    _msgReset(e) {
        var ref = firebase.database().ref("/" + this.myData.code + "/doctors");
        ref.orderByChild("code").equalTo(e).once("value").then(function (data) {
            if (data.exists()) {
                if (Object.values(data.val())[0].lastMsg) {
                    ref.child(Object.keys(data.val())[0]).update({ lastMsg: null });
                    firebase.database().ref('/' + this.myData.code + '/uniqueId/msg').transaction(qty => qty = 0).then(() => { });
                }
            }
        }.bind(this));
    }

    _ifIncomingMsg(e) {
        if (e === this.myData.code) return false;
        else return true;
    }

    _ifOutgoingMsg(e) {
        if (e === this.myData.code) return true;
        else return false;
    }

    _toggleDrawer() {
        this.dispatchEvent(new CustomEvent('toggleDrawer', {
            bubbles: true, composed: true
        }));
    }
}

window.customElements.define('my-messaging', MyMessaging);