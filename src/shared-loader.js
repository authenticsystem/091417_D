import { html } from '@polymer/polymer/polymer-element.js';

export const sharedLoader = html`
    <style>
      .loader {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #7E57C2;
        }

        .loader .pulse {
          height: 100px;
          width: 200px;
          overflow: hidden;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
        }

        .loader .pulse:after {
          content: '';
          display: block;
          background: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 xmlns:xlink=%22http://www.w3.org/1999/xlink%22 viewBox=%220 0 200px 100px%22 enable-background=%22new 0 0 200px 100px%22 xml:space=%22preserve%22><polyline fill=%22none%22 stroke-width=%223px%22 stroke=%22white%22 points=%222.4,58.7 70.8,58.7 76.1,46.2 81.1,58.7 89.9,58.7 93.8,66.5 102.8,22.7 110.6,78.7 115.3,58.7 126.4,58.7 134.4,54.7 142.4,58.7 197.8,58.7 %22/></svg>') 0 0 no-repeat;
          width: 100%;
          height: 100%;
          position: absolute;
          -webkit-animation: 2s pulse linear infinite;
          -moz-animation: 2s pulse linear infinite;
          -o-animation: 2s pulse linear infinite;
          animation: 2s pulse linear infinite;
          clip: rect(0, 0, 100px, 0);
        }

        .loader .pulse:before {
          content: '';
          position: absolute;
          z-index: -1;
          left: 2px;
          right: 2px;
          bottom: 0;
          top: 16px;
          margin: auto;
          height: 3px;
        }

        .loader p {
          position: absolute;
          top: 96px;
          left: 16px;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Crafty Girls', cursive;
          padding: 3rem 1rem 0;
          text-align: center;
          line-height: 1.3;
          letter-spacing: 4px;
          font-size: 1.125em;
          color: #f2f2f2;
        }

        @-webkit-keyframes pulse {
          0% {
            clip: rect(0, 0, 100px, 0);
            opacity: 0.4;
          }

          4% {
            clip: rect(0, 66.66667px, 100px, 0);
            opacity: 0.6;
          }

          15% {
            clip: rect(0, 133.33333px, 100px, 0);
            opacity: 0.8;
          }

          20% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 1;
          }

          80% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 0;
          }

          90% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 0;
          }

          100% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0% {
            clip: rect(0, 0, 100px, 0);
          }

          4% {
            clip: rect(0, 66.66667px, 100px, 0);
          }

          15% {
            clip: rect(0, 133.33333px, 100px, 0);
          }

          20% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 1;
          }

          80% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 0;
          }

          90% {
            opacity: 0;
          }

          100% {
            clip: rect(0, 300px, 100px, 0);
            opacity: 0;
          }
        }
    </style>
`;