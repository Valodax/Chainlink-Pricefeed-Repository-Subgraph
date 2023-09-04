import { Address, DataSourceContext } from "@graphprotocol/graph-ts";
import { FeedConfirmed as FeedConfirmedEvent } from "../generated/FeedRegistry/FeedRegistry";
import { DataFeed, FeedInfo } from "../generated/schema";
import { DataFeed as PriceDataFeedTemplate } from "../generated/templates";

const ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
const ID = "id";

export function handleFeedConfirmed(event: FeedConfirmedEvent): void {
  // Feed Confirmed event is emitted when a feed is added, updated, or removed
  let prevFeed = FeedInfo.load(event.params.previousAggregator); // current aggregator

  // if we haven't since this previous feed before, or the next feed is not the zero address, then this is a new feed and we need to create it
  if (prevFeed == null || event.params.latestAggregator != ZERO_ADDRESS) {
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
    context.setString(ID, event.params.latestAggregator.toHexString());
    PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
  } else if (prevFeed != null) {
    prevFeed.live = event.params.latestAggregator == ZERO_ADDRESS ? false : true;
    if (prevFeed.live == false) {
      prevFeed.timeDeprecated = event.block.timestamp;
    }
    prevFeed.save();
  }
}
