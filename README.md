# Raiden Statistics

This project aims to show raiden statics inline with [lightning statics](https://bitcoinvisuals.com/lightning).
Sample Raiden statics can be

- Number of nodes with and without channels
- Number of unique channels each node has
- Network Capacity i.e. Cumulative capacity of each channel

## Charts and their data

These statics are to be represented as date histogram graphs. For this purpose we use the [react-timeseries-charts](https://software.es.net/react-timeseries-charts/#/). The primary source of data which we use in this case is [eth.events](https://eth.events) and tutorial for the same could be found [here](https://ethevents.readthedocs.io/en/latest/).
The eth.events server is basically a elasticsearch server which accumulates event data from numerous contracts on the ethereum blockchain. Contract events as soon as they are emitted by the contracts are stored as documents on the **eth.events** elasticsearch servers. Get started started with elasticsearch [here](https://www.elastic.co/guide/en/elasticsearch/reference/6.5/getting-started-concepts.html).

## Events and Contracts

For now we query the Token Network Contract on the mainnet address `0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474`.
Have a look at the code [here](https://etherscan.io/address/0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474#code). Generally we look at these four events but could consider more or even take the help of constant functions to query the contract if needed.

1. ChannelOpened
2. ChannelClosed
3. ChannelNewDeposit
4. ChannelClosed

Definitions of all the events can be found [here](https://etherscan.io/address/0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474#code)

## Queries for Chart data

Preliminary understanding to formulate eth.events queries can be found [here](https://ethevents.readthedocs.io/en/latest/elastic/tutorials/query.html).
We mostly concentrate on making an [aggregate queries](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html) for all the statics in raiden using eth.events.
Currently only [one query](https://github.com/agatsoh/raiden_analytics/blob/master/src/services/helpers/event_queries.ts) with [one chart](https://github.com/agatsoh/raiden_analytics/tree/master/src/components/raiden_event_chart) exists showing a date histogram of the times each of the above event was fired. Queries should be first tested on curl or more likely a tool like postman and then could be included in the project for more processing and display at the frontend.
