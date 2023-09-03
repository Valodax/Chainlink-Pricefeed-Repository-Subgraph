import { Address, DataSourceContext } from "@graphprotocol/graph-ts";
import { FeedConfirmed as FeedConfirmedEvent } from "../generated/FeedRegistry/FeedRegistry";
import { PriceDataFeed, Info } from "../generated/schema";
import { PriceDataFeed as PriceDataFeedTemplate } from "../generated/templates";

export function handleFeedConfirmed(event: FeedConfirmedEvent): void {
  // Feed Confirmed event is emitted when a feed is added, updated, or removed

  let prevEntity = Info.load(event.params.previousAggregator); // current aggregator
  if (prevEntity == null) {
    let priceDataFeed = new PriceDataFeed(event.params.latestAggregator); // new aggregator
    priceDataFeed.save();
    // if previous aggregator is null, then this is a new feed
    let priceDataFeedInfo = new Info(event.params.latestAggregator);
    priceDataFeedInfo.asset = event.params.asset; // bytes
    priceDataFeedInfo.denomination = event.params.denomination; // bytes
    priceDataFeedInfo.aggregatorAddress = event.params.latestAggregator; // address
    priceDataFeedInfo.timeCreated = event.block.timestamp;
    priceDataFeedInfo.live = true;
    priceDataFeedInfo.feed = priceDataFeed.id;
    priceDataFeedInfo.save(); // save new feed

    // Create the new Price Data Feed Template
    let context = new DataSourceContext();
    context.setString("id", event.params.latestAggregator.toHex());
    PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
    //}
  } else {
    // if previous aggregator is not null, then this is an update to the already existing feed
    if (event.params.latestAggregator == Address.fromString("0x0000000000000000000000000000000000000000")) {
      // if latestAggregator is null, then this is an entire removal of the feed
      prevEntity.live = false;
      prevEntity.save();
    } else {
      // Create the new Price Data Feed
      let priceDataFeed = new PriceDataFeed(event.params.latestAggregator);
      priceDataFeed.save();

      // if latest aggregator is not null, then this is an update to the feed
      let priceDataFeedInfo = new Info(event.params.latestAggregator);
      priceDataFeedInfo.asset = event.params.asset; // bytes
      priceDataFeedInfo.denomination = event.params.denomination; // bytes
      priceDataFeedInfo.aggregatorAddress = event.params.latestAggregator; // address
      priceDataFeedInfo.timeCreated = event.block.timestamp;
      priceDataFeedInfo.live = true;
      priceDataFeedInfo.feed = priceDataFeed.id;
      priceDataFeedInfo.save(); // save new feed

      prevEntity.live = false;
      prevEntity.save();

      // Create the Price Data Feed Template
      let context = new DataSourceContext();
      context.setString("id", event.params.latestAggregator.toHex());
      PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
    }
  }
}
