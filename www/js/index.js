/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

'use strict';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        FastClick.attach(document.body);
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        iniciarApp();
    }
};

var loadTemplate = function (id) {
    id = id.search('-template') === -1 ? id + '-template' : id;
    var tmpl = document.getElementById(id);
    if (tmpl.innerHTML.trim() === '') {
        getAjax(tmpl.src, function (html) {
            tmpl.innerHTML = html;
        });
    }

    return tmpl;
};

var loadTemplatesIds = function () {
    var inputs = document.getElementsByTagName('script'),
        i,
        arr = [];

    for(i = 0; i < inputs.length; i++) {
        if(inputs[i].type.toLowerCase() == 'text/html') {
            arr.push(inputs[i].id);
        }
    }
    return arr;
};

var successHandler = function (result) {
    console.log("Callback Success! Result = " + result);
}

var errorHandler = function (error) {
    console.log('Callback error = ' + error);
}

function iniciarApp() {
    var resultAppStatus = appStatus(),
        pushNotification = window.plugins.pushNotification,
        notData = {
            "senderID" : "282537612256",
            "ecb" : "acciones.onNotification"
        };

    pushNotification.register(successHandler, errorHandler, notData);

    if (resultAppStatus === 1) {
        var ids = loadTemplatesIds();
        ids.forEach(function (tmp){
            var val = loadTemplate(tmp);
            document.getElementById(tmp).value = val;
        });

        Finch.listen();
    }
}

function appStatus() {

    var appStatus = window.localStorage.getItem("appStatus");   // Control Status App 0 Primera Vez 1 Ya iniciada
    if (appStatus === null) {
        //alert('Se inicio por primera vez');
        window.localStorage.setItem("appStatus", 1);   // Control Iniciamos la app
        return 1;
    } else {
        return 1;
    }
}