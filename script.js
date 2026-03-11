// create map of city of Calgary
var map = L.map('map').setView([51.04619055613446,-114.06160542305022], 10);

// add tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// create marker variable
var marker;

// create client
var client;

// function to establish connection
function startConnect() {

    // get values from user
    var host = document.getElementById("host").value;
    var port = Number(document.getElementById("port").value);

    // make sure both are pressed
    if (!host || !port) {
        alert("Please enter both a broker host and a port number.");
        return;
    }

    // give client random numbers for ID
    client = new Paho.MQTT.Client(host, port, "client_" + Math.random());

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    
    // connect client
    client.connect({
        onSuccess: onConnect,
        useSSL: true
    });

    // disable changing host and port values
    document.getElementById("host").disabled = true;
    document.getElementById("port").disabled = true;
}

// function when client connects
function onConnect() {
    // send message
    console.log("Connected to MQTT message broker!");

    // enable ability to choose topic, send message, and share status
    document.getElementById("topic").disabled = false;
    document.getElementById("message").disabled = false;
    document.getElementById("PublishButton").disabled = false;
    document.getElementById("StatusButton").disabled = false;

    // subscribe to temperature topic
    client.subscribe("ENGO_551/Tony_Nguyen/my_temperature");
}

// function to end connection
function endConnect() {

    // disconnect client
    if (client && client.isConnected()) {
        client.disconnect();
        console.log("Disconnected from MQTT message broker.");
    }

    // enable changing inputs
    document.getElementById("host").disabled = false;
    document.getElementById("port").disabled = false; 
    
    // disable ability to choose topic, send message, or share status
    document.getElementById("topic").disabled = true;
    document.getElementById("message").disabled = true;
    document.getElementById("PublishButton").disabled = true;
    document.getElementById("StatusButton").disabled = true;
}

// function when client loses connection
function onConnectionLost(responseObject) {
    // send message
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    
    // send message about attempted reconnection
    alert("Attempting to reconnect!");
    
    // try to reconnect after 3 seconds
    setTimeout(startConnect, 3000);

    }
}

// function to publish message
function publishMessage() {

    // get topic and message from user
    var topic = document.getElementById("topic").value;
    var message = document.getElementById("message").value;

    // make sure user is connected to broker
    if (!client || !client.isConnected()) {
        alert("A host broker and a port number need to be entered to send a message.");
        return
    }

    // make sure both topic and message entered
    if (!topic || !message) {
        alert("Please enter both a topic and a message.");
        return
    }

    // send message
    var mqtt = new Paho.MQTT.Message(message);
    mqtt.destinationName = topic;
    client.send(mqtt);
}

// function for when message arrived
function onMessageArrived(mqtt) {
    console.log("onMessageArrived: " + mqtt.payloadString);

    // get data from GeoJSON
    var data = JSON.parse(mqtt.payloadString);
    var long = data.geometry.coordinates[0];
    var lat = data.geometry.coordinates[1];
    var temp = data.properties.temperature;

    // choose colour based on temperature
    var colour;

    if (temp >= -40 && temp < 10) {
        colour = "blue";
    } 
    else if (temp >= 10 && temp < 30) {
        colour = "green";
    }
    else if (temp >= 30 && temp <= 60) {
        colour = "red";
    }

    // remove old markers
    if (marker) {
        map.removeLayer(marker);
    }
    
    // create marker and add to map
    var marker = L.circleMarker([lat, long], {
        color: colour
    }).addTo(map);

    // add popup with temperature
    marker.bindPopup("Temperature: " + temp + "°C");
}

// function to share status
function shareStatus() {

    // make sure user is connected to broker
    if (!client || !client.isConnected()) {
        alert("A host broker and a port number need to be entered to send a message.");
        return
    }
    
    // make sure Geolocation Javascript API is working
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by the browser.");
        return;
    }

    // use API
    navigator.geolocation.getCurrentPosition(function(position) {
        
        // get latitude and longitude
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        // get random temperature value
        var min = -40;
        var max = 60;
        var temp = Math.floor(Math.random() * (max - min + 1) + min);

        // generate GeoJSON
        var geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [long, lat]
            },
            "properties": {
                "temperature": temp
            }
        };

        // convert to MQTT
        var mqtt = new Paho.MQTT.Message(JSON.stringify(geojson));
        mqtt.destinationName = "ENGO_551/Tony_Nguyen/my_temperature";
        client.send(mqtt);

        console.log("GeoJSON published: ", geojson);

    });
}