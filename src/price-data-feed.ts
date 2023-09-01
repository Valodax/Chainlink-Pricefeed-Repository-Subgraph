import { Address, Entity } from "@graphprotocol/graph-ts";
import { dataSource } from "@graphprotocol/graph-ts";

import {
  AnswerUpdated as AnswerUpdatedEvent,
  NewRound as NewRoundEvent,
} from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { PriceDataFeed, AnswerUpdated, NewRound } from "../generated/schema";

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
  let entity = new AnswerUpdated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.current = event.params.current;
  entity.roundId = event.params.roundId;
  entity.updatedAt = event.params.updatedAt;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleNewRound(event: NewRoundEvent): void {
  let entity = new NewRound(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.roundId = event.params.roundId;
  entity.startedAt = event.params.startedAt;
  entity.startedBy = event.params.startedBy;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
