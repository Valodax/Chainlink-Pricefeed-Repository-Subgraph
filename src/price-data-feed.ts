import { Address, dataSource } from "@graphprotocol/graph-ts";
import { AnswerUpdated as AnswerUpdatedEvent } from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { PriceDataFeed, Info, Price } from "../generated/schema";
import { AccessControlledOffchainAggregator } from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
  let context = dataSource.context();
  let addressString = context.getString("id");
  let address = Address.fromString(addressString);
  let priceDataFeed = PriceDataFeed.load(address);

  if (priceDataFeed) {
    let info = Info.load(address);
    if (info && info.name == null) {
      // if info exists and name is null, then this is the first price for this feed so we can add the information.
      let contract = AccessControlledOffchainAggregator.bind(address);
      let description = contract.try_description();
      if (!description.reverted) {
        info.name = description.value;
        info.asset = description.value.split("/")[0].trim();
        info.denomination = description.value.split("/")[1].trim();
        info.save();
      }
    }

    // Create a new PriceDataPoint
    let dataPointId = event.transaction.hash; // txHash
    let priceDataPoint = new Price(dataPointId); // id is txHash
    priceDataPoint.feed = priceDataFeed.id; // address
    priceDataPoint.price = event.params.current; // BigInt
    priceDataPoint.roundId = event.params.roundId; // BigInt
    priceDataPoint.blockNumber = event.block.number;
    priceDataPoint.blockTimestamp = event.params.updatedAt; // BigInt
    priceDataPoint.save();
  }
}
