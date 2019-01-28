import React from "react";
import { render } from "react-dom";
import EthEventsQueryService from "../../services/eth_event_service";
import "./raiden_event_chart.css";
import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  ScatterChart,
  Resizable,
  Styler,
  EventMarker
} from "react-timeseries-charts";
import { TimeSeries, Index } from "pondjs";
import { any } from "prop-types";

interface EventType {
  key: number;
  key_as_string: string;
  doc_count: number;
}

class RaidenEventChart extends React.Component<{}, {}> {
  public state: any;
  constructor(props: {}) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      tracker: null,
      trackerValue: "",
      trackerEvent: null,
      markerMode: "flag",
      raidenEventSeries: null
    };
  }

  componentDidMount() {
    EthEventsQueryService.fetchAllEvents()
      .then(data => {
        return data.aggregations.event_agg.buckets;
      })
      .then(buckets => {
        const eventSeries = new TimeSeries({
          name: "Raiden Event Series",
          columns: ["time", "open", "close", "settled", "newdeposit"],
          points: this.buildPoints(buckets)
        });
        this.setState({
          isLoaded: true,
          raidenEventSeries: eventSeries
        });
      });
  }

  buildPoints(buckets: any) {
    let points: number[][] = [];
    let openEvents = buckets.open.channelevents_histogram.buckets;
    let closeEvents = buckets.close.channelevents_histogram.buckets;
    let settledEvents = buckets.settled.channelevents_histogram.buckets;
    let newdepositEvents = buckets.newdeposit.channelevents_histogram.buckets;
    console.log(openEvents);
    console.log(closeEvents);
    console.log(settledEvents);
    console.log(newdepositEvents);
    openEvents.map((obj: any, index: number) => {
      points.push([
        obj.key,
        obj.doc_count,
        this.checkArray(closeEvents, obj, index),
        this.checkArray(settledEvents, obj, index),
        this.checkArray(newdepositEvents, obj, index)
      ]);
    });
    return points;
  }

  checkArray(arr: EventType[], obj: any, index: number): number {
    if (
      typeof arr != "undefined" &&
      arr != null &&
      arr.length != null &&
      arr.length > 0 &&
      typeof arr[index] != "undefined"
    ) {
      return arr[index].key === obj.key ? arr[index].doc_count : 0;
    } else {
      return 0;
    }
  }

  handleTrackerChanged = (t: any) => {
    if (t) {
      const e = this.state.raidenEventSeries.atTime(t);
      let day = new Date(e.begin().getTime()).toDateString();
      this.setState({
        trackerValue: [
          { label: "Date", value: `${day}` },
          { label: "open", value: `${e.get("open")}` },
          { label: "close", value: `${e.get("close")}` },
          { label: "settled", value: `${e.get("settled")}` }
        ],
        trackerEvent: e
      });
    }
  };

  renderMarker() {
    return (
      <EventMarker
        type="flag"
        axis="count"
        event={this.state.trackerEvent}
        column="open"
        info={this.state.trackerValue}
        infoTimeFormat="%Y-%M-%d"
        infoWidth={120}
        markerRadius={2}
        markerStyle={{ fill: "black" }}
      />
    );
  }

  render() {
    if (this.state.isLoaded) {
      return (
        <Resizable>
          <ChartContainer
            title="Raiden Events"
            timeRange={this.state.raidenEventSeries.timerange()}
            titleStyle={{ fill: "#555", fontWeight: 500 }}
            utc={true}
            onTrackerChanged={this.handleTrackerChanged}
          >
            <ChartRow height="250">
              <YAxis
                id="count"
                label="Event Count"
                type="linear"
                min={this.state.raidenEventSeries.min("open")}
                max={this.state.raidenEventSeries.max("open")}
              />
              <Charts>
                <LineChart
                  axis="count"
                  series={this.state.raidenEventSeries}
                  columns={["open"]}
                  style={{ open: { normal: { stroke: "steelblue" } } }}
                  visible={true}
                />
                <LineChart
                  axis="count"
                  series={this.state.raidenEventSeries}
                  columns={["close"]}
                  style={{ close: { normal: { stroke: "black" } } }}
                  visible={true}
                />
                <LineChart
                  axis="count"
                  series={this.state.raidenEventSeries}
                  columns={["settled"]}
                  style={{ settled: { normal: { stroke: "green" } } }}
                />
                {this.renderMarker()}
              </Charts>
            </ChartRow>
          </ChartContainer>
        </Resizable>
      );
    } else {
      return <div>The chart is getting Loaded</div>;
    }
  }
}

export default RaidenEventChart;
