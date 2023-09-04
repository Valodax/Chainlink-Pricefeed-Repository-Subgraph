import { Address, dataSource } from "@graphprotocol/graph-ts";
import {
  AnswerUpdated as AnswerUpdatedEvent,
  AccessControlledOffchainAggregator,
} from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { DataFeed, FeedInfo, DataPoint } from "../generated/schema";

const ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
const ID = "id";

export function handleAnswerUpdated(event: AnswerUpdatedEvent): void {
  let context = dataSource.context();
  let addressString = context.getString(ID);
  let address = Address.fromString(addressString);
  let dataFeed = DataFeed.load(address);

  if (dataFeed) {
    let info = FeedInfo.load(address);
    if (info && info.name == null && info.id !== ZERO_ADDRESS) {
      // if info exists and name is null, then this is the first price for this feed so we can add the information.
      let contract = AccessControlledOffchainAggregator.bind(address);
      let description = contract.try_description();
      if (!description.reverted) {
        info.name = description.value;
        let splitDescription = description.value.split("/");
        info.asset = splitDescription[0].trim();
        info.denomination = splitDescription[1].trim();
      }
      let decimals = contract.try_decimals();
      if (!decimals.reverted) {
        info.decimals = decimals.value;
      }
      info.timeLastPrice = event.block.timestamp;
      info.save();
    }

    // Create a new PriceDataPoint
    let dataPointId = event.transaction.hash; // txHash as bytes
    let dataPoint = new DataPoint(dataPointId); // id is txHash
    dataPoint.feed = dataFeed.id; // address of this feed
    dataPoint.price = event.params.current; // BigInt
    dataPoint.roundId = event.params.roundId; // BigInt
    dataPoint.blockNumber = event.block.number;
    dataPoint.blockTimestamp = event.params.updatedAt; // BigInt
    dataPoint.save();
  }
}
