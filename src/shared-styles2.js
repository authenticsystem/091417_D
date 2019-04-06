import { html } from '@polymer/polymer/polymer-element.js';

export const itemStyles = html`
  <style>
      :host {
        display: block;
        /* height: 100vh;
        margin: 0;

        display: flex;
        flex-direction: column; */
      }

      iron-scroll-threshold {
        height: 100vh;
      }

      .item {
        /* @apply --layout-horizontal; */
        /* padding: 15px; */
        background-color: white;
        border-bottom: 1px solid #ddd;
        transition: all .2s ease-in-out;
      }

      .center {
        @apply --layout-horizontal;
        padding: 15px;
      }

      .item:hover {
        cursor: pointer;
        opacity: 0.7;
      }

      .pad {
        margin-left: 10px;
        @apply --layout-flex;
        @apply --layout-vertical;
      }

      iron-list {
        max-width: 736px;
        margin: 16px auto;
      }

      #noRecord {
        width: 736px;
        margin: 16px auto;
      }

      @media (max-width: 1010px) {
        iron-list {
          margin: 8px;
          display: flex;
          flex-direction: column;
        }

        #noRecord {
          width: calc(100% - 16px);
          margin: 8px;
          display: flex;
          flex-direction: column;
        }
      }

      .clinic {
        font-size: 12px;
      }

      .pencil {
        color: #673AB7;
        bottom: 8px;
      }

      .loading-indicator {
        margin-top: 16px;
        text-align: center;
        height: 40px;
      }

      paper-spinner {
        width: 20px;
        height: 20px;
        margin-right: 10px;
      }
  </style>
`;

export const itemPlaceholder = html`
  <style>
    .ph-item {
      position: relative;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      padding: 30px 15px 15px;
      overflow: hidden;
      /* margin-bottom: 30px; */
      background-color: #fff;
      border: 1px solid #e6e6e6;
      border-radius: 2px
    }

    .ph-item,
    .ph-item *,
    .ph-item :after,
    .ph-item :before {
      -webkit-box-sizing: border-box;
      box-sizing: border-box
    }

    .ph-item:before {
      content: " ";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 50%;
      z-index: 1;
      width: 500%;
      margin-left: -250%;
      -webkit-animation: a .8s linear infinite;
      animation: a .8s linear infinite;
      background: -webkit-gradient(linear, left top, right top, color-stop(46%, hsla(0, 0%, 100%, 0)), color-stop(50%, hsla(0, 0%, 100%, .35)), color-stop(54%, hsla(0, 0%, 100%, 0))) 50% 50%;
      background: linear-gradient(90deg, hsla(0, 0%, 100%, 0) 46%, hsla(0, 0%, 100%, .35) 50%, hsla(0, 0%, 100%, 0) 54%) 50% 50%
    }

    .ph-item>* {
      -webkit-box-flex: 1;
      -ms-flex: 1 1 auto;
      flex: 1 1 auto;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-flow: column;
      flex-flow: column;
      /* padding-right: 15px;
      padding-left: 15px */
    }

    .ph-item>*,
    .ph-row {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex
    }

    .ph-row {
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      margin-bottom: 7.5px
    }

    .ph-row div {
      height: 8px;
      margin-bottom: 7.5px;
      background-color: #ced4da
    }

    .ph-row .big,
    .ph-row.big div {
      height: 12px;
      margin-bottom: 7.5px
    }

    .ph-row .empty {
      background-color: hsla(0, 0%, 100%, 0)
    }

    .ph-col-1 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 8.335%;
      flex: 0 0 8.335%
    }

    .ph-col-2 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 16.66667%;
      flex: 0 0 16.66667%
    }

    .ph-col-4 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 33.33333%;
      flex: 0 0 33.33333%
    }

    .ph-col-6 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 50%;
      flex: 0 0 50%
    }

    .ph-col-8 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 66.66667%;
      flex: 0 0 66.66667%
    }

    .ph-col-10 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 83.33333%;
      flex: 0 0 83.33333%
    }

    .ph-col-12 {
      -webkit-box-flex: 0;
      -ms-flex: 0 0 100%;
      flex: 0 0 100%
    }

    .ph-avatar {
      position: relative;
      width: 100%;
      min-width: 45px;
      background-color: #ced4da;
      margin-bottom: 15px;
      border-radius: 50%;
      overflow: hidden
    }

    .ph-avatar:before {
      content: " ";
      display: block;
      padding-top: 100%
    }

    .ph-picture {
      width: 100%;
      height: 120px;
      background-color: #ced4da;
      margin-bottom: 15px
    }

    @-webkit-keyframes a {
      0% {
        -webkit-transform: translate3d(-30%, 0, 0);
        transform: translate3d(-30%, 0, 0)
      }

      to {
        -webkit-transform: translate3d(30%, 0, 0);
        transform: translate3d(30%, 0, 0)
      }
    }

    @keyframes a {
      0% {
        -webkit-transform: translate3d(-30%, 0, 0);
        transform: translate3d(-30%, 0, 0)
      }

      to {
        -webkit-transform: translate3d(30%, 0, 0);
        transform: translate3d(30%, 0, 0)
      }
    }

    .ph-item {
      width: 736px;
      margin: 16px auto;
      padding: 16px;
    }

    @media (max-width: 1010px) {
      .ph-item {
        width: calc(100% - 16px);
        margin: 8px;
        padding: 16px;
      }

      .ph-col-1 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 10%;
        flex: 0 0 10%
      }

      .ph-col-6 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 60%;
        flex: 0 0 60%
      }

      .ph-col-8 {
        -webkit-box-flex: 0;
        -ms-flex: 0 0 80%;
        flex: 0 0 80%
      }

      .ph-avatar { margin-right: 16px; }
    }
  </style>
`;

export const messagingStyles = html`
  <style>
    p { white-space: pre; }

    footer {
      padding: 0;
      font-size: 16px;
      background-color: white;
      -webkit-box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
      -moz-box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
      box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
    }

      /* Messaging shared styles */
    .textarea {
      width: 100%;
      margin-top: -16px;
      margin-bottom: 3px;
    }

    .mnu {
      padding: 13px;
      overflow: auto;
      height: calc(100vh - 90px);
    }

    /* Message design */
    .content {
      padding: 16px;
      overflow: auto;
      @apply --layout-flex;
    }

    .incoming_msg {
      display: flex;
      margin-top: 13px;
      margin-bottom: 13px;
    }

    .received_msg { padding: 0 0 0 10px; }
    .received_withd_msg p {
      background: rgb(253, 253, 253) none repeat scroll 0 0;
      border-radius: 3px;
      color: #3f3e3e;
      font-size: 14px;
      margin: 0;
      padding: 5px 10px 5px 12px;
    }

    .outgoing_msg {
      overflow: hidden;
      margin: 13px 0 13px;
    }

    .sent_msg { float: right; }
    .sent_msg p {
      background: #05728f none repeat scroll 0 0;
      border-radius: 3px;
      font-size: 14px;
      margin: 0;
      color: #fff;
      padding: 5px 10px 5px 12px;
    }

    .time_date {
      color: #747474;
      display: block;
      font-size: 12px;
      margin: 8px 0 0;
    }

    footer {
      background-color: white;
      -webkit-box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
      -moz-box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
      box-shadow: -1px -3px 18px -1px rgba(209, 194, 209, 1);
    }

    .item-header {
      border-bottom: 1px solid #ddd;
      padding: 20px;
      text-align: center;
    }

    .emoticon_not_active {
      color: black;
      transition: 0.3s;
    }

    .emoticon_not_active:hover {
      color: rebeccapurple;
    }

    .emoticon_active {
      color: rebeccapurple;
      transition: 0.3s;
    }

    .emoticon_active:hover { opacity: 0.6; }
    .emoji { cursor: pointer; }
    .emoji:hover { opacity: 0.7; }
  </style>
`;