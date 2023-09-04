import { Address, DataSourceContext } from "@graphprotocol/graph-ts";
import { FeedConfirmed as FeedConfirmedEvent } from "../generated/FeedRegistry/FeedRegistry";
import { DataFeed, FeedInfo } from "../generated/schema";
import { DataFeed as PriceDataFeedTemplate } from "../generated/templates";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleFeedConfirmed(event: FeedConfirmedEvent): void {
  // Feed Confirmed event is emitted when a feed is added, updated, or removed
  let prevFeed = FeedInfo.load(event.params.previousAggregator); // current aggregator

  if (prevFeed == null || event.params.latestAggregator != Address.fromString(ZERO_ADDRESS)) {
    let feed = new DataFeed(event.params.latestAggregator);
    feed.save();

    // if previous aggregator is null, then this is a new feed
    let feedInfo = new FeedInfo(event.params.latestAggregator);
    feedInfo.assetAddress = event.params.asset; // bytes
    feedInfo.denominationAddress = event.params.denomination; // bytes
    feedInfo.timeCreated = event.block.timestamp; // int
    feedInfo.phaseId = event.params.nextPhaseId; // int
    feedInfo.live = true; // boolean
    feedInfo.feed = feed.id; // address
    feedInfo.save(); // save new feed

    // Create the new Price Data Feed Template
    let context = new DataSourceContext();
    context.setString("id", event.params.latestAggregator.toHexString());
    PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
  }

  if (prevFeed != null) {
    prevFeed.live = event.params.latestAggregator == Address.fromString(ZERO_ADDRESS) ? false : true;
    if (!prevFeed.live) {
      prevFeed.timeDeprecated = event.block.timestamp;
    }
    prevFeed.save();
  }
}
