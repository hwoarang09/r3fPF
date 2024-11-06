import React from "react";
import MqttPublisher from "./components/MqttPublisher";

const App: React.FC = () => {
  console.log("hi");
  return (
    <div className="App">
      <MqttPublisher />
    </div>
  );
};

export default App;
