/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cordova = require('cordova'),
    audioObjects = {};

module.exports = {

    create: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            src = args[1];

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);

        if (typeof src == "undefined"){
            audioObjects[id] = new Audio();
        } else {
            audioObjects[id] = new Audio(src);
        }

        // Media Events
        // TODO: add stalled, canplay, and timeupdate events
        audioObjects[id].onStalled = function() {
        };

        audioObjects[id].onCanPlay = function() {
        };

        audioObjects[id].onTimeUpdate = function() {
        };

        audioObjects[id].onEnded = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);
        };

        audioObjects[id].onDurationChange = function() {
          Media.onStatus(id, Media.MEDIA_DURATION, this.duration);
        };

        audioObjects[id].onPlaying = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_RUNNING);
        };

        audioObjects[id].onPlay = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);
        };

        audioObjects[id].onPause = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_PAUSED);
        };

        audioObjects[id].onError = function(e) {
          // audio playback failed - show a message saying why
          // to get the source of the audio element use $(this).src
          switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
              errMsg = 'You aborted the video playback.';
              break;
            case e.target.error.MEDIA_ERR_NETWORK:
              errMsg = 'A network error caused the audio download to fail.';
              break;
            case e.target.error.MEDIA_ERR_DECODE:
              errMsg = 'The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.';
              break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errMsg = 'The video audio not be loaded, either because the server or network failed or because the format is not supported.';
              break;
            default:
              errMsg = 'An unknown error occurred.';
              break;
          }

          Media.onStatus(id, Media.MEDIA_ERROR, errMsg);
        };

        return {"status" : 1, "message" : "Audio object created" };
    },

    startPlayingAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (args.length === 1 || typeof args[1] == "undefined" ) {
            return {"status" : 9, "message" : "Media source argument not found"};
        }

        // event listeners
        audio.addEventListener('durationchange', audio.onDurationChange);
        audio.addEventListener('canplay', audio.onCanPlay);
        audio.addEventListener('ended', audio.onEnded);
        audio.addEventListener('timeupdate', audio.onTimeUpdate);
        audio.addEventListener('durationchange', audio.onDurationChange);
        audio.addEventListener('playing', audio.onPlaying);
        audio.addEventListener('play', audio.onPlay);
        audio.addEventListener('pause', audio.onPause);
        audio.addEventListener('error', audio.onError);
        audio.addEventListener('stalled', audio.onStalled);

        audio.play();

        return {"status" : 1, "message" : "Audio play started" };
    },

    stopPlayingAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        audio.pause();
        audioObjects[id] = undefined;

        return {"status" : 1, "message" : "Audio play stopped" };
    },

    seekToAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            result = {"status" : 2, "message" : "Audio Object has not been initialized"};
        } else if (args.length === 1) {
            result = {"status" : 9, "message" : "Media seek time argument not found"};
        } else {
            try {
                audio.currentTime = args[1];
            } catch (e) {
                return {"status" : 3, "message" : "Error seeking audio: " + e};
            }

            result = {"status" : 1, "message" : "Seek to audio succeeded" };
        }
        return result;
    },

    pausePlayingAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        audio.pause();

        return {"status" : 1, "message" : "Audio paused" };
    },

    getCurrentPositionAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        Media.onStatus(id, Media.MEDIA_POSITION, audio.currentTime);

        return {"status" : 1, "message" : audio.currentTime };
    },

    startRecordingAudio: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        if (args.length <= 1) {
            return {"status" : 9, "message" : "Media start recording, insufficient arguments"};
        }

        blackberry.media.microphone.record(args[1], win, fail);
        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" };
    },

    stopRecordingAudio: function (win, fail, args) {
    },

    release: function (win, fail, args) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (audio) {
            if(audio.src !== ""){
                audio.src = undefined;
            }
            audioObjects[id] = undefined;
            delete audioObjects[id];
        }

        result = {"status" : 1, "message" : "Media resources released"};

        return result;
    }

};

require('cordova/firefoxos/commandProxy').add('Media', module.exports);
