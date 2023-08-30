import { Address, Entity } from "@graphprotocol/graph-ts";
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
  PriceDataFeed,
} from "../generated/schema";

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
  let entity = new FeedConfirmed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.asset = event.params.asset;
  entity.denomination = event.params.denomination;
  entity.latestAggregator = event.params.latestAggregator;
  entity.previousAggregator = event.params.previousAggregator;
  entity.nextPhaseId = event.params.nextPhaseId;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
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

export function handleUpdateFeed(event: FeedConfirmedEvent): void {
  let prevEntity = PriceDataFeed.load(event.params.previousAggregator); // current aggregator
  if (prevEntity == null) {
    // if previous aggregator is null, then this is a new feed
    let newEntity = new PriceDataFeed(event.params.latestAggregator);
    newEntity.asset = event.params.asset; // bytes
    newEntity.denomination = event.params.denomination; // bytes
    newEntity.aggregator = event.params.latestAggregator; // address
    newEntity.live = true;
    // save new feed and is live
    newEntity.save();
  } else {
    // if previous aggregator is not null, then this is an update to the already existing feed
    if (event.params.latestAggregator == Address.fromString("0x0000000000000000000000000000000000000000")) {
      // if latest aggregator is null, then this is a removal of the feed
      prevEntity.live = false;
      prevEntity.save();
    } else {
      // if latest aggregator is not null, then this is an update to the feed
      let newEntity = new PriceDataFeed(event.params.latestAggregator);
      newEntity.asset = event.params.asset; // bytes
      newEntity.denomination = event.params.denomination; // bytes
      newEntity.aggregator = event.params.latestAggregator; // address
      newEntity.live = true;
      newEntity.save();
      prevEntity.live = false;
      prevEntity.save();
    }
  }
}
