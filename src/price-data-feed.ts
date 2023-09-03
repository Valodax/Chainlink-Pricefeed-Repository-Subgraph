import { Address, dataSource } from "@graphprotocol/graph-ts";
import { AnswerUpdated as AnswerUpdatedEvent } from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { PriceDataFeed, Price } from "../generated/schema";

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
  let context = dataSource.context();
  let addressString = context.getString("id");
  let address = Address.fromString(addressString);
  let priceDataFeed = PriceDataFeed.load(address);

  if (priceDataFeed) {
    // Create a new PriceDataPoint
    let dataPointId = event.transaction.hash.concatI32(event.logIndex.toI32());
    let priceDataPoint = new Price(dataPointId); // id is txHash
    priceDataPoint.feed = priceDataFeed.id; // address
    priceDataPoint.price = event.params.current; // BigInt
    priceDataPoint.roundId = event.params.roundId; // BigInt
    priceDataPoint.blockNumber = event.block.number;
    priceDataPoint.blockTimestamp = event.params.updatedAt; // BigInt
    priceDataPoint.save();
  }
}
