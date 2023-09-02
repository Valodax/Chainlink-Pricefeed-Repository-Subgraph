import { Address, Entity } from "@graphprotocol/graph-ts";
import { dataSource } from "@graphprotocol/graph-ts";

import {
  AnswerUpdated as AnswerUpdatedEvent,
  NewRound as NewRoundEvent,
} from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { PriceDataFeed, AnswerUpdated, NewRound } from "../generated/schema";

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
  let answerUpdated = new AnswerUpdated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  answerUpdated.current = event.params.current;
  answerUpdated.roundId = event.params.roundId;
  answerUpdated.updatedAt = event.params.updatedAt;

  answerUpdated.blockNumber = event.block.number;
  answerUpdated.blockTimestamp = event.block.timestamp;
  answerUpdated.transactionHash = event.transaction.hash;
  answerUpdated.save();

  let context = dataSource.context();
  let addressString = context.getString("id");
  let address = Address.fromString(addressString);
  let priceDataFeed = PriceDataFeed.load(address);

  if (priceDataFeed) {
    priceDataFeed.current = event.params.current;
    priceDataFeed.updatedAt = event.params.updatedAt;
    priceDataFeed.roundId = event.params.roundId;
    priceDataFeed.save();
  }
}

export function handleNewRound(event: NewRoundEvent): void {
  let newRound = new NewRound(event.transaction.hash.concatI32(event.logIndex.toI32()));
  newRound.roundId = event.params.roundId;
  newRound.startedAt = event.params.startedAt;
  newRound.startedBy = event.params.startedBy;

  newRound.blockNumber = event.block.number;
  newRound.blockTimestamp = event.block.timestamp;
  newRound.transactionHash = event.transaction.hash;

  newRound.save();
}
