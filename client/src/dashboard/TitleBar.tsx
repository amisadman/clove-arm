import { useEffect, useState } from "react";
import { getControllerCount, subscribeControllerCount } from "../controls/remoteStore";
import "./TitleBar.css";

function TitleBar() {
  const [controllerCount, setControllerCount] = useState(getControllerCount());

  useEffect(() => subscribeControllerCount(() => setControllerCount(getControllerCount())), []);

  const connected = controllerCount > 0;

  return (
    <div className="title-bar">
      <div>
        <span className="title-bar-name">
          CLOVE<span style={{ color: "#d7bf66" }}>ARM</span>
        </span>
      </div>
      <div className="title-bar-badge-container">
        <span className={`controller-badge ${connected ? "connected" : "disconnected"}`}>
          📱 {connected ? `${controllerCount} controller connected` : "No controller"}
        </span>
      </div>
    </div>
  );
}

export default TitleBar;
