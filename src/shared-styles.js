import '@polymer/polymer/polymer-element.js';

/* 
app-drawer-layout:not([narrow]) paper-icon-button.main {
  display: none;
} */

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="shared-styles">
  <template>
    <style>
      /* IE 10 support for HTML5 hidden attr */
      :host([hidden]), [hidden] {
        display: none !important;
      }

      a {
        color: var(--paper-blue-800);
        text-decoration: none;
        outline: none;
        -moz-outline-style: none;
      }

      a:hover {
        cursor: pointer;
        color: gray;
      }

      h1 {
        margin: 10px 0;
        color: #404040;
        font-size: 24px;
        font-weight: 500;
      }

      h3 {
        margin: 10px 0;
        color: #404040;
        font-size: 18px;
        font-weight: 500;
      }

      app-header {
        color: #fff;
        background-color: var(--app-primary-color);
      }

      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }

      app-toolbar.search{
        background: white; 
        color: black;
      }

      .drawer-list {
        margin: 0 20px;
      }

      .drawer-list a {
        display: block;
        padding: 0 16px;
        text-decoration: none;
        color: var(--app-secondary-color);
        line-height: 40px;
      }

      .drawer-list a.iron-selected {
        color: var(--app-primary-color);
        font-weight: bold;
      }

      .main-toolbar {
        padding: 16px;
        height: 145px;
        background-image: url('../images/background.jpeg');
        background-size: cover;
      }
      
      .item-avatar {
        height: 45px;
        width: 45px;
        border: 2px solid white;
        border-radius: 50%;
        box-sizing: border-box;
        background-color: #DDD;
      }

      .avatar-container {
        border: 2px solid #00AA8D;
        border-radius: 50%;
        height: 90px;
        padding: 2px;
        width: 90px;
        margin: 16px;
      }

      .avatar-container .image {
        background-size: contain;
        border-radius: 50%;
        height: 100%;
        width: 100%;
      }

      .contact-info {
        margin: 3px 20px;
        padding-bottom: 6px;
        color: white;
      }

      .contact-info .name {
        font-size: 14px;
        font-weight: bold;
      }

      .contact-info .email {
        font-size: 12px;
        color: #fefe;
      }

      .content-list {
        height: calc(100vh - 14em);
        overflow: auto;
      }

      footer {
        padding: 16px;
        font-size: 13px;
        color: #999;
        z-index: 199;
        background: #333333;
      }

      .content-list a.iron-selected  {
        color: var(--app-primary-color);
      }

      paper-icon-item {
        --paper-item-focused: {
          color: var(--app-primary-color);
        }
      }

      paper-icon-button.main {
        margin-right: 10px;
      }

      paper-icon-button.secondary {
        margin-right: 10px;
      }

      .error {
        color: red;
        font-size: 15px;
      }
      
      .breaker {
        border-bottom: 1px solid #CCC;
        width: 90%;
        margin: 8px;
      }

      .primary-text {
        font-size: 14px;
        font-weight: 400;
        color: #262626;
      }

      .long-text {
        font-size: 14px;
        font-weight: 400;
        color: gray;
      }

      .small-text {
        font-size: 12px;
        color: gray;
      }

      .flex {
        @apply --layout-flex;
      }

      .horizontal {
        @apply --layout-horizontal;
      }

      .vertical {
        @apply --layout-vertical;
      }

      .flex-equal-justified {
        @apply --layout-horizontal;
        @apply --layout-justified;
      }

      .flex-equal-around-justified {
        @apply --layout-horizontal;
        @apply --layout-around-justified;
      }

      .flex-wrap {
        @apply --layout-horizontal;
        @apply --layout-wrap;
        width: 200px;
      }

      .card-holder {
        margin: 16px 8px;
      }

      .polymer-card {
        margin: 16px;
        padding: 16px;
        color: #757575;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
        position: relative;
      }

      .polymer-card-header {
        height: 48px;
        font-weight: bold;
        vertical-align: middle;
        width: 100%;
      }

      @media (max-width: 480px) {
        .polymer-card { margin: 8px; }
      }

      .card {
        padding: 16px;
        color: #757575;
        background-color: #fff;
        max-width: 736px;
        margin: 6px auto;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
        transition: all .2s ease-in-out;
      }

      .card:hover {
        cursor: pointer;
        box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
        margin-bottom: 6px;
      }

      .circle {
        display: inline-block;
        width: 64px;
        height: 64px;
        text-align: center;
        color: #555;
        border-radius: 50%;
        background: #ddd;
        font-size: 30px;
        line-height: 64px;
      }

      .truncate {
        width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      } 

      .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }

      .galleryHolder {
        padding: 6px;
        border: 1px solid gray
      }

      .image:hover { opacity: 0.7; }
      .image { transition: 0.3s; }

      .upload-btn-wrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
        margin-left: 10px;
      }

      .btn {
        border: 2px solid gray;
        color: gray;
        background-color: white;
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: bold;
      }

      .upload-btn-wrapper input[type=file] {
        font-size: 15px;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
      }

      paper-button {
        height: 32px;
        font-size: 12px;
        font-weight: 400;
      }

      paper-button.primary {
        font-size: 14px;
        border-radius: 0;
        background-color:  var(--paper-blue-800);
        color: white;
        padding: 16px 36px;
        margin: 6px 0;
        margin-top: 56px;
        text-transform: none;
      }

      paper-button.primary [disabled] {
        background-color: #d9d9d9;
        color: black;
      }

      paper-button.secondary {
        font-size: 14px;
        border-radius: 0;
        background-color: #d9d9d9;
        color: black;
        padding: 16px 36px;
        margin: 6px 0;
        text-transform: none;
      }

      paper-button.primary.loading {
        background-color:  #fff;
        border: 1px solid gray;
        color: #333;
      }

      paper-button.primary:hover{
        background-color:  var(--paper-blue-900);
      }

      paper-button.secondary:hover {
        background-color: #b3b3b3;
      }

      paper-button.primary.loading:hover{
        background-color:  #fff;
      }

      paper-item {
        min-height: var(--paper-item-min-height, 36px);
        padding: 0 16px;
        line-height: 18px;
        color: #333;
        cursor: pointer;
        font-size: 14px;
      }

      paper-item:hover {
        background: #eee;
      }

      paper-fab.fab-menu {
        position: fixed;
        right: 32px;
        bottom: 32px;
      }
      
      @media (min-width: 640px) {
        .paper-fab-0 {
          position: absolute;
          left: 32px;
          bottom: 32px;
        }

        .paper-fab-1 {
          position: absolute;
          right: 32px;
          bottom: 32px;
        }
      }

      @media (max-width: 640px) {
        .paper-fab-0 {
          position: absolute;
          left: 16px;
          bottom: 32px;
        }

        .paper-fab-1 {
          position: absolute;
          right: 16px;
          bottom: 32px;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
