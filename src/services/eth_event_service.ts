import allEventsAggregateQuery from "./helpers/event_queries";
import config from "./config";

export default class EthEventsQueryService {
  static async fetchAllEvents() {
    const eventBody = allEventsAggregateQuery;
    const options = {
      method: "POST",
      body: JSON.stringify(eventBody),
      headers: this.event_headers()
    };
    const response = await fetch(config.base_url, options);
    let data = await response.json();
    return data;
  }

  static event_headers() {
    return {
      Authorization: `Bearer ${config.bearer_token}`,
      "Content-Type": `application/json`,
      Accept: `application/json`
    };
  }
}
