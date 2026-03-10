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

    // set callback handler for lost connection
    client.onConnectionLost = onConnectionLost;
    
    // connect client
    client.connect({onSuccess: onConnect});

    // disable changing host and port values
    document.getElementById("host").disabled = true;
    document.getElementById("port").disabled = true;
}

// function when client connects
function onConnect() {
    // send message
    console.log("Connected to MQTT message broker!");
}

// function to end connection
function endConnect() {

    if (client && client.isConnected()) {
        client.disconnect();
        console.log("Disconnected from MQTT message broker.");
    }

    // enable changing inputs
    document.getElementById("host").disabled = false;
    document.getElementById("port").disabled = false;    
}

// function when client loses connection
function onConnectionLost(responseObject) {
    // send message
    if (responseObject.errorCode !== 0) {
        console.log("Connection Lost: " + responseObject.errorMessage);
    

    // send message about attempted reconnection
    alert("Attempting to reconnect!");
    
    // try to reconnect after 3 seconds
    setTimeout(startConnect, 3000);

    }
}