cordova.define("org.apache.cordova.media.FxosMedia", function(require, exports, module) { /*
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

var cordova = require('cordova');

module.exports = {

    create: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        var id = args[0],
            src = args[1],
            thisM = Media.get(id);

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);
        Media.prototype.node = null;

        if (typeof src == "undefined"){
            thisM.node = new Audio();
        } else {
            thisM.node = new Audio(src);
        }

        // TODO: Firefox OS Hack: play audio in background
        thisM.node.preload = 'auto'
        thisM.node.mozAudioChannelType = 'content'

        // Media Events
        // TODO: add stalled, canplay, and timeupdate events
        thisM.node.onStalled = function() {
        };

        thisM.node.onCanPlay = function() {
        };

        thisM.node.onTimeUpdate = function() {
        };

        thisM.node.onEnded = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);
        };

        thisM.node.onDurationChange = function() {
          Media.onStatus(id, Media.MEDIA_DURATION, this.duration);
        };

        thisM.node.onPlaying = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_RUNNING);
        };

        thisM.node.onPlay = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);
        };

        thisM.node.onPause = function() {
          Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_PAUSED);
        };

        thisM.node.onError = function(e) {
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
    },

    startPlayingAudio: function (win, fail, args) {
        if (!args.length) {
            return;
        }

        var id = args[0],
            thisM = Media.get(id);

        if (args.length === 1 || typeof args[1] == "undefined" ) {
            return;
        }

        // event listeners
        thisM.node.addEventListener('durationchange', thisM.node.onDurationChange);
        thisM.node.addEventListener('canplay', thisM.node.onCanPlay);
        thisM.node.addEventListener('ended', thisM.node.onEnded);
        thisM.node.addEventListener('timeupdate', thisM.node.onTimeUpdate);
        thisM.node.addEventListener('durationchange', thisM.node.onDurationChange);
        thisM.node.addEventListener('playing', thisM.node.onPlaying);
        thisM.node.addEventListener('play', thisM.node.onPlay);
        thisM.node.addEventListener('pause', thisM.node.onPause);
        thisM.node.addEventListener('error', thisM.node.onError);
        thisM.node.addEventListener('stalled', thisM.node.onStalled);

        thisM.node.play();
    },

    stopPlayingAudio: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return; 
        }

        var id = args[0],
            thisM = Media.get(id);

        if (!thisM) {
            fail("Audio Object has not been initialized");
            return;
        }

        thisM.node.pause();
        thisM = undefined;

        win("Audion play stopped");
    },

    seekToAudio: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        var id = args[0],
            thisM = Media.get(id);

        if (!thisM) {
            fail("Audio Object has not been initialized");
        } else if (args.length === 1) {
            fail("Media seek time argument not found");
        } else {
            try {
                thisM.node.currentTime = args[1];
            } catch (e) {
                fail("Error seeking audio: " + e);
                return;
            }

            win("Seek to audio succeeded");
        }
    },

    pausePlayingAudio: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        var id = args[0],
            thisM = Media.get(id);

        if (!thisM) {
            fail("Audio Object has not been initialized");
            return;
        }

        thisM.node.pause();
    },

    getCurrentPositionAudio: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        var id = args[0],
            thisM = Media.get(id);

        if (!thisM) {
            fail("Audio Object has not been initialized");
            return;
        }

        Media.onStatus(id, Media.MEDIA_POSITION, thisM.node.currentTime);

        win(thisM.node.currentTime);
    },

    startRecordingAudio: function (win, fail, args) {
        if (!args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        if (args.length <= 1) {
            fail("Media start recording, insufficient arguments");
            return;
        }

        // TODO: Start recording
    },

    stopRecordingAudio: function (win, fail, args) {
        // TODO: Stop recording
    },

    setVolume: function(win, fail, args) {
        var id = args[0],
            thisM = Media.get(id),
            volume = args[1];

        thisM.node.volume = volume;
    },


    release: function (win, fail, args) {
        if (typeof args == 'undefined' || !args.length) {
            fail("Media Object id was not sent in arguments");
            return;
        }

        var id = args[0],
            thisM = Media.get(id);

        if (thisM) {
            if(thisM.node.src !== ""){
                thisM.node.src = undefined;
            }
            thisM = undefined;
            delete id;
        }
    }
};

require('cordova/firefoxos/commandProxy').add('Media', module.exports);
});
