import { assert, describe, newMockEvent, dataSourceMock, test } from "matchstick-as/assembly/index";
import { Address, ethereum, DataSourceContext, Value, BigInt } from "@graphprotocol/graph-ts";
import { FeedConfirmed } from "../generated/FeedRegistry/FeedRegistry";
import { handleFeedConfirmed } from "../src/feed-registry";
import { AnswerUpdated } from "../generated/templates/PriceDataFeed/AccessControlledOffchainAggregator";
import { handleAnswerUpdated } from "../src/price-data-feed";

// For more test scenarios, see:
// https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

export function createNewPriceFeedConfirmedEvent(
  asset: string,
  denomination: string,
  latestAggregator: string,
  previousAggregator: string,
  sender: string
): FeedConfirmed {
  let pricefeedConfirmedEvent = changetype<FeedConfirmed>(newMockEvent());
  pricefeedConfirmedEvent.parameters = new Array();
  pricefeedConfirmedEvent.parameters.push(
    new ethereum.EventParam("asset", ethereum.Value.fromAddress(Address.fromString(asset)))
  );
  pricefeedConfirmedEvent.parameters.push(
    new ethereum.EventParam("denomination", ethereum.Value.fromAddress(Address.fromString(denomination)))
  );
  pricefeedConfirmedEvent.parameters.push(
    new ethereum.EventParam("latestAggregator", ethereum.Value.fromAddress(Address.fromString(latestAggregator)))
  );
  pricefeedConfirmedEvent.parameters.push(
    new ethereum.EventParam("previousAggregator", ethereum.Value.fromAddress(Address.fromString(previousAggregator)))
  );
  pricefeedConfirmedEvent.parameters.push(new ethereum.EventParam("nextPhaseId", ethereum.Value.fromI32(1)));
  pricefeedConfirmedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(Address.fromString(sender)))
  );

  return pricefeedConfirmedEvent;
}

export function createNewAnswerUpdatedEvent(current: BigInt, roundId: BigInt, updatedAt: BigInt): AnswerUpdated {
  let answerUpdatedEvent = changetype<AnswerUpdated>(newMockEvent());
  answerUpdatedEvent.parameters = new Array();
  answerUpdatedEvent.parameters.push(new ethereum.EventParam("current", ethereum.Value.fromUnsignedBigInt(current)));
  answerUpdatedEvent.parameters.push(new ethereum.EventParam("roundId", ethereum.Value.fromUnsignedBigInt(roundId)));
  answerUpdatedEvent.parameters.push(
    new ethereum.EventParam("updatedAt", ethereum.Value.fromUnsignedBigInt(updatedAt))
  );
  return answerUpdatedEvent;
}

describe("FeedRegistry", () => {
  test("Can handle PriceDataFeed Entity", () => {
    const asset = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
    const denomination = "0x0000000000000000000000000000000000000348";
    const latestAggregator = "0x145f040dbcdff4cbe8debbd58861296012fcb269";
    const previousAggregator = "0x0000000000000000000000000000000000000000";
    const sender = "0x21f73d42eb58ba49ddb685dc29d3bf5c0f0373ca";
    let pricefeedConfirmedEvent = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      latestAggregator,
      previousAggregator,
      sender
    );
    handleFeedConfirmed(pricefeedConfirmedEvent);
    assert.fieldEquals("Info", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "true");
    assert.fieldEquals("Info", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "denominationSymbol", "USD");
  });

  test("Can handle the case where a feed is updated", () => {
    const asset = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
    const denomination = "0x0000000000000000000000000000000000000348";
    const latestAggregator = "0x145f040dbcdff4cbe8debbd58861296012fcb269";
    const previousAggregator = "0x0000000000000000000000000000000000000000";
    const sender = "0x21f73d42eb58ba49ddb685dc29d3bf5c0f0373ca";
    let pricefeedConfirmedEvent = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      latestAggregator,
      previousAggregator,
      sender
    );
    handleFeedConfirmed(pricefeedConfirmedEvent);
    let secondConfirmedPriceFeed = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      "0x64a119dcf78e7e3fced89c429f6f47bf0cd80250",
      "0x145f040dbcdff4cbe8debbd58861296012fcb269",
      sender
    );
    handleFeedConfirmed(secondConfirmedPriceFeed);
    assert.fieldEquals("Info", "0x64a119dcf78e7e3fced89c429f6f47bf0cd80250", "live", "true");
    assert.fieldEquals("Info", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "false");
  });

  test("Can handle the case where a feed is removed", () => {
    const asset = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
    const denomination = "0x0000000000000000000000000000000000000348";
    const latestAggregator = "0x145f040dbcdff4cbe8debbd58861296012fcb269";
    const previousAggregator = "0x0000000000000000000000000000000000000000";
    const sender = "0x21f73d42eb58ba49ddb685dc29d3bf5c0f0373ca";
    let pricefeedConfirmedEvent = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      latestAggregator,
      previousAggregator,
      sender
    );
    handleFeedConfirmed(pricefeedConfirmedEvent);
    let secondConfirmedPriceFeed = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      "0x0000000000000000000000000000000000000000",
      "0x145f040dbcdff4cbe8debbd58861296012fcb269",
      sender
    );
    handleFeedConfirmed(secondConfirmedPriceFeed);
    assert.fieldEquals("Info", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "false");
  });
});

describe("PriceDataFeed", () => {
  test("Can create a PriceDataFeed from Registry", () => {
    const asset = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
    const denomination = "0x0000000000000000000000000000000000000348";
    const latestAggregator = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
    const previousAggregator = "0x0000000000000000000000000000000000000000";
    const sender = "0x21f73d42eb58ba49ddb685dc29d3bf5c0f0373ca";
    const current = BigInt.fromI64(6755600117382373);
    const roundId = BigInt.fromI64(84);
    const updatedAt = BigInt.fromI64(1693581575);
    let pricefeedConfirmedEvent = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      latestAggregator,
      previousAggregator,
      sender
    );
    handleFeedConfirmed(pricefeedConfirmedEvent); // create the PriceDataFeedInfo and PriceDataFeed
    assert.fieldEquals(
      "PriceDataFeed",
      "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
      "id",
      "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e"
    );

    // price feed has been created; now we can test the AnswerUpdatedHandler
    let context = new DataSourceContext();
    context.set("id", Value.fromString(latestAggregator));
    let addressString = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e"; // fake address
    dataSourceMock.setReturnValues(addressString, "mainnet", context); // mocking the return values for dataSourceMock
    let answerUpdatedEvent = createNewAnswerUpdatedEvent(current, roundId, updatedAt);
    handleAnswerUpdated(answerUpdatedEvent);
    assert.fieldEquals(
      "PriceDataFeed",
      "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
      "priceDataPoints",
      `[${BigInt.fromI64(6755600117382373).toString()}]`
    );
  });
});
