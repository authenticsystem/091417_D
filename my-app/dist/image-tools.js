
"use strict";

var hasBlobConstructor = typeof (Blob) !== 'undefined' && (function () {
    try {
        return Boolean(new Blob());
    }
    catch (e) {
        return false;
    }
}());
var hasArrayBufferViewSupport = hasBlobConstructor && typeof (Uint8Array) !== 'undefined' && (function () {
    try {
        return new Blob([new Uint8Array(100)]).size === 100;
    }
    catch (e) {
        return false;
    }
}());
var hasToBlobSupport = (typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.toBlob : false);
var hasBlobSupport = (hasToBlobSupport ||
    (typeof Uint8Array !== 'undefined' && typeof ArrayBuffer !== 'undefined' && typeof atob !== 'undefined'));
var hasReaderSupport = (typeof FileReader !== 'undefined' || typeof URL !== 'undefined');
var ImageTools = /** @class */ (function () {
    function ImageTools() {
    }
    ImageTools.resize = function (file, maxDimensions, callback) {
        if (typeof maxDimensions === 'function') {
            callback = maxDimensions;
            maxDimensions = {
                width: 640,
                height: 480
            };
        }
        if (!ImageTools.isSupported() || !file.type.match(/image.*/)) {
            callback(file, false);
            return false;
        }
        if (file.type.match(/image\/gif/)) {
            // Not attempting, could be an animated gif
            callback(file, false);
            // TODO: use https://github.com/antimatter15/whammy to convert gif to webm
            return false;
        }
        var image = document.createElement('img');
        image.onload = function (imgEvt) {
            var width = image.width;
            var height = image.height;
            var isTooLarge = false;
            if (width >= height && width > maxDimensions.width) {
                isTooLarge = true;
            }
            else if (height > maxDimensions.height) {
                isTooLarge = true;
            }
            if (!isTooLarge) {
                // early exit; no need to resize
                callback(file, false);
                return;
            }
            var scaleRatio = maxDimensions.width / width;
            // TODO number of resampling steps
            // const steps = Math.ceil(Math.log(width / (width * scaleRatio)) / Math.log(2));
            width *= scaleRatio;
            height *= scaleRatio;
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(image, 0, 0, width, height);
            if (hasToBlobSupport) {
                canvas.toBlob(function (blob) {
                    callback(blob, true);
                }, file.type);
            }
            else {
                var blob = ImageTools._toBlob(canvas, file.type);
                callback(blob, true);
            }
        };
        ImageTools._loadImage(image, file);
        return true;
    };

    ImageTools._toBlob = function (canvas, type) {
        var dataURI = canvas.toDataURL(type);
        var dataURIParts = dataURI.split(',');
        var byteString;
        if (dataURIParts[0].indexOf('base64') >= 0) {
            // Convert base64 to raw binary data held in a string:
            byteString = atob(dataURIParts[1]);
        }
        else {
            // Convert base64/URLEncoded data component to raw binary data:
            byteString = decodeURIComponent(dataURIParts[1]);
        }
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var intArray = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
        }
        var mimeString = dataURIParts[0].split(':')[1].split(';')[0];
        var blob = null;
        if (hasBlobConstructor) {
            blob = new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mimeString });
        }
        else {
            blob = new Blob([arrayBuffer]);
        }
        return blob;
    };

    ImageTools._loadImage = function (image, file, callback) {
        if (typeof (URL) === 'undefined') {
            var reader = new FileReader();
            reader.onload = function (evt) {
                image.src = evt.target.result;
                if (callback) {
                    callback();
                }
            };
            reader.readAsDataURL(file);
        }
        else {
            image.src = URL.createObjectURL(file);
            if (callback) {
                callback();
            }
        }
    };

    ImageTools.isSupported = function () {
        return ((typeof (HTMLCanvasElement) !== 'undefined')
            && hasBlobSupport
            && hasReaderSupport);
    };

    ImageTools._toFile = function (theBlob, fileName) {
        var b = theBlob;
        b.lastModifiedDate = new Date();
        b.name = fileName;
        return theBlob;
    };

    return ImageTools;
}());
