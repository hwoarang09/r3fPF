import React from "react";
import MqttPublisher from "./components/MqttPublisher";

const App: React.FC = () => {
  return (
    <div className="App overflow-hidden">
      <MqttPublisher />
    </div>
  );
};

export default App;
