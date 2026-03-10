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
    client.connect({onSuccess: onConnect});

    // disable changing host and port values
    document.getElementById("host").disabled = true;
    document.getElementById("port").disabled = true;
}

// function when client connects
function onConnect() {
    // send message
    console.log("Connected to MQTT message broker!");

    // enable ability to choose topic and send message

    document.getElementById("topic").disabled = false;
    document.getElementById("message").disabled = false;
    document.getElementById("PublishButton").disabled = false;
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
    
    // disable ability to choose topic and send message
    document.getElementById("topic").disabled = true;
    document.getElementById("message").disabled = true;
    document.getElementById("PublishButton").disabled = true;
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
}