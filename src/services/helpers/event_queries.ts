const allEventsAggregateQuery = {
  size: 0,
  query: {
    bool: {
      must: {
        match: { "address.raw": "0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474" }
      }
    }
  },
  aggs: {
    event_agg: {
      filters: {
        filters: {
          open: { match: { "event.raw": "ChannelOpened" } },
          close: { match: { "event.raw": "ChannelClosed" } },
          newdeposit: { match: { "event.raw": "ChannelNewDeposit " } },
          settled: { match: { "event.raw": "ChannelSettled" } }
        }
      },
      aggs: {
        channelevents_histogram: {
          date_histogram: {
            field: "timestamp",
            interval: "day",
            format: "yyyy-MM-dd"
          }
        }
      }
    }
  }
};

export default allEventsAggregateQuery;
