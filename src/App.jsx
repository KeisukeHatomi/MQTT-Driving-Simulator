import { useState, useEffect } from "react";
import * as Styles from "./Styles";
import Canvas from "./Canvas";
import mqtt from "mqtt";

function App() {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subMessages, setSubMessages] = useState([]);
  const [pubMessage, setPubMessage] = useState("");
  const str = [];

  useEffect(() => {
    // MQTTサーバーに接続
    const mqttClient = mqtt.connect(
      "wss://t191933e.ala.asia-southeast1.emqxsl.com:8084/mqtt",
      {
        username: "user001",
        password: "user001",
      }
    );

    mqttClient.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to MQTT broker");
      mqttClient.subscribe("emqx/esp32"); 
    });

    mqttClient.on("message", (topic, message) => {
      console.log("Received message:", topic, message.toString());

      str.push(message.toString() + "\n");
      if (str.length > 5) {
        str.shift(0);
      }
      setSubMessages(JSON.parse(message.toString()));
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const publishMessage = () => {
    if (client && isConnected) {
      client.publish("emqx/esp32", pubMessage);
      setPubMessage("");
    }
  };

  return (
    <div>
      MQTT Driving Simulator
      {/* <canvas style={Styles.canvasGrid}></canvas>
      <canvas style={Styles.canvasCourse}></canvas>
      <canvas style={Styles.canvasCart}></canvas> */}
      <Canvas 
        command = {subMessages}
        />
    </div>
  );
}

export default App;
