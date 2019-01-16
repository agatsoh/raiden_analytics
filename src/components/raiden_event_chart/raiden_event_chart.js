import React from "react";
import { render } from "react-dom";
import EthEventsQueryService from "../../services/eth_event_service.js";
import { ResponsiveLine } from "@nivo/line";
import "./raiden_event_chart.css";

class RaidenEventChart extends React.Component {
  constructor(props) {
    super(props);
    this.i = 1;
    this.state = {
      error: null,
      isLoaded: false,
      nivoArray: []
    };
  }

  componentDidMount() {
    EthEventsQueryService.fetchAllEvents()
      .then(data => {
        return data.aggregations.event_agg.buckets;
      })
      .then(buckets => {
        this.setState({
          isLoaded: true,
          nivoArray: this.makeNivoDataArray(buckets)
        });
      });
  }

  makeNivoDataArray(buckets) {
    let closeEvents = buckets.close.channelevents_histogram.buckets;
    let openEvents = buckets.open.channelevents_histogram.buckets;
    let settledEvents = buckets.settled.channelevents_histogram.buckets;
    let newdepositEvents = buckets.newdeposit.channelevents_histogram.buckets;
    return [
      this.makeNivoDataObject(closeEvents, "close", "hsl(207, 70%, 50%)"),
      this.makeNivoDataObject(openEvents, "open", "hsl(285, 70%, 50%)"),
      this.makeNivoDataObject(settledEvents, "settle", "hsl(145, 70%, 50%)"),
      this.makeNivoDataObject(
        newdepositEvents,
        "newdeposit",
        "hsl(72, 70%, 50%)"
      )
    ];
  }

  makeNivoDataObject(events, type, color) {
    return {
      id: type,
      color: color,
      data: events.map(event => {
        return {
          x: event.key_as_string,
          y: event.doc_count
        };
      })
    };
  }

  render() {
    const { error, isLoaded, nivoArray } = this.state;
    console.log(this.i);
    this.i++;
    // console.log(nivoArray);

    if (isLoaded) {
      console.log("Isloaded is true");
      return (
        <div className="event_chart">
          <ResponsiveLine
            data={nivoArray}
            margin={{
              top: 50,
              right: 110,
              bottom: 50,
              left: 60
            }}
            xScale={{
              type: "point"
            }}
            yScale={{
              type: "linear",
              stacked: true,
              min: "auto",
              max: "auto"
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              orient: "bottom",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "transportation",
              legendOffset: 36,
              legendPosition: "middle"
            }}
            axisLeft={{
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "count",
              legendOffset: -40,
              legendPosition: "middle"
            }}
            dotSize={10}
            dotColor="inherit:darker(0.3)"
            dotBorderWidth={2}
            dotBorderColor="#ffffff"
            enableDotLabel={true}
            dotLabel="y"
            dotLabelYOffset={-12}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </div>
      );
    } else {
      return (
        <div className="raiden_event_chart">This is the Raiden Event Chart</div>
      );
    }
  }
}

export default RaidenEventChart;
