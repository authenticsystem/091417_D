import { html } from '@polymer/polymer/polymer-element.js';

export const sharedSignInCard = html`
    <style>
        :host {
            display: block;
            background-image: url('../../images/first-background.jpg');
            background-size: cover;
            height: calc(100vh - 1px);
            padding: 0.1px;
        }

        @media (max-width: 437px) {
            .sign-in-card {
                height: calc(100vh - 80px);
            }
        }
        
        @media (max-width: 438px) {
            .sign-in-card {
                margin: auto;
            }
        }
        
        @media (min-width: 438px) {
            .sign-in-card {
                margin: 16px auto;
                margin-top: 56px;
                border: 1px solid gray;
            }
        }

        .sign-in-card {
            padding: 40px;
            color: #757575;
            background-color: #fff;
            max-width: 356px;
            box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.5);
            -webkit-box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.5);
        }

        paper-item:hover {
            background-color: #eeeeee;
            cursor: pointer;
        }
    </style>
`;