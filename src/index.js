import React from "react";
import ReactDom from "react-dom";
import RaidenEventChart from "./components/raiden_event_chart/raiden_event_chart";

class RaidenStatics extends React.Component {
  render() {
    return (
      <div className="raiden_statistics">
        These are the raiden statistics
        <RaidenEventChart />
      </div>
    );
  }
}
ReactDom.render(<RaidenStatics />, document.getElementById("root"));
