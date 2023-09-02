import { Address, Entity, DataSourceContext, BigInt } from "@graphprotocol/graph-ts";
import {
  AccessControllerSet as AccessControllerSetEvent,
  FeedConfirmed as FeedConfirmedEvent,
  FeedProposed as FeedProposedEvent,
  OwnershipTransferRequested as OwnershipTransferRequestedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/FeedRegistry/FeedRegistry";
import {
  AccessControllerSet,
  FeedConfirmed,
  FeedProposed,
  OwnershipTransferRequested,
  OwnershipTransferred,
  PriceDataFeedStatus,
  PriceDataFeed,
} from "../generated/schema";
import { PriceDataFeed as PriceDataFeedTemplate } from "../generated/templates";

export function handleAccessControllerSet(event: AccessControllerSetEvent): void {
  let entity = new AccessControllerSet(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.accessController = event.params.accessController;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleFeedConfirmed(event: FeedConfirmedEvent): void {
  // Feed Confirmed event is emitted when a feed is added, updated, or removed
  let feedConfirmed = new FeedConfirmed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  feedConfirmed.asset = event.params.asset;
  feedConfirmed.denomination = event.params.denomination;
  feedConfirmed.latestAggregator = event.params.latestAggregator;
  feedConfirmed.previousAggregator = event.params.previousAggregator;
  feedConfirmed.nextPhaseId = event.params.nextPhaseId;
  feedConfirmed.sender = event.params.sender;

  feedConfirmed.blockNumber = event.block.number;
  feedConfirmed.blockTimestamp = event.block.timestamp;
  feedConfirmed.transactionHash = event.transaction.hash;

  feedConfirmed.save();

  let prevEntity = PriceDataFeedStatus.load(event.params.previousAggregator); // current aggregator
  if (prevEntity == null) {
    // if previous aggregator is null, then this is a new feed
    let newEntity = new PriceDataFeedStatus(event.params.latestAggregator);
    newEntity.asset = event.params.asset; // bytes
    newEntity.denomination = event.params.denomination; // bytes
    newEntity.aggregator = event.params.latestAggregator; // address
    newEntity.timeCreated = event.block.timestamp;
    newEntity.live = true;
    newEntity.save(); // save new feed

    // if (newEntity.aggregator == Address.fromString("0xf939e0a03fb07f59a73314e73794be0e57ac1b4e")) {
    // Create the new Price Data Feed
    let priceDataFeed = new PriceDataFeed(event.params.latestAggregator);
    priceDataFeed.currentArray = new Array<BigInt>();
    priceDataFeed.updatedAtArray = new Array<BigInt>();
    priceDataFeed.roundIdArray = new Array<BigInt>();
    priceDataFeed.save();

    // Create the new Price Data Feed Template
    let context = new DataSourceContext();
    context.setString("id", event.params.latestAggregator.toHex());
    PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
    //}
  } else {
    // if previous aggregator is not null, then this is an update to the already existing feed
    if (event.params.latestAggregator == Address.fromString("0x0000000000000000000000000000000000000000")) {
      // if latest aggregator is null, then this is a removal of the feed
      prevEntity.live = false;
      prevEntity.save();
    } else {
      // if latest aggregator is not null, then this is an update to the feed
      let newEntity = new PriceDataFeedStatus(event.params.latestAggregator);
      newEntity.asset = event.params.asset; // bytes
      newEntity.denomination = event.params.denomination; // bytes
      newEntity.aggregator = event.params.latestAggregator; // address
      newEntity.timeCreated = event.block.timestamp;

      prevEntity.live = false;
      newEntity.live = true;
      prevEntity.save();
      newEntity.save();

      //if (newEntity.aggregator == Address.fromString("0xf939e0a03fb07f59a73314e73794be0e57ac1b4e")) {
      // Create the new Price Data Feed
      let priceDataFeed = new PriceDataFeed(event.params.latestAggregator);
      priceDataFeed.currentArray = new Array<BigInt>();
      priceDataFeed.updatedAtArray = new Array<BigInt>();
      priceDataFeed.roundIdArray = new Array<BigInt>();
      priceDataFeed.save();

      // Create the Price Data Feed Template
      let context = new DataSourceContext();
      context.setString("id", event.params.latestAggregator.toHex());
      PriceDataFeedTemplate.createWithContext(event.params.latestAggregator, context);
      //}
    }
  }
}

export function handleFeedProposed(event: FeedProposedEvent): void {
  let entity = new FeedProposed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.asset = event.params.asset;
  entity.denomination = event.params.denomination;
  entity.proposedAggregator = event.params.proposedAggregator;
  entity.currentAggregator = event.params.currentAggregator;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferRequested(event: OwnershipTransferRequestedEvent): void {
  let entity = new OwnershipTransferRequested(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.from = event.params.from;
  entity.to = event.params.to;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let entity = new OwnershipTransferred(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.from = event.params.from;
  entity.to = event.params.to;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
