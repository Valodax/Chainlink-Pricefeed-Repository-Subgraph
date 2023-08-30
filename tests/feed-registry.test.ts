import { assert, describe, clearStore, beforeAll, afterAll, newMockEvent, test } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { AccessControllerSet } from "../generated/schema";
import { AccessControllerSet as AccessControllerSetEvent } from "../generated/FeedRegistry/FeedRegistry";
import { handleUpdateFeed } from "../src/feed-registry";
import { createAccessControllerSetEvent } from "./feed-registry-utils";
import { FeedConfirmed } from "../generated/FeedRegistry/FeedRegistry";

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
    handleUpdateFeed(pricefeedConfirmedEvent);
    assert.fieldEquals("PriceDataFeed", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "true");
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
    handleUpdateFeed(pricefeedConfirmedEvent);
    let secondConfirmedPriceFeed = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      "0x64a119dcf78e7e3fced89c429f6f47bf0cd80250",
      "0x145f040dbcdff4cbe8debbd58861296012fcb269",
      sender
    );
    handleUpdateFeed(secondConfirmedPriceFeed);
    assert.fieldEquals("PriceDataFeed", "0x64a119dcf78e7e3fced89c429f6f47bf0cd80250", "live", "true");
    assert.fieldEquals("PriceDataFeed", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "false");
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
    handleUpdateFeed(pricefeedConfirmedEvent);
    let secondConfirmedPriceFeed = createNewPriceFeedConfirmedEvent(
      asset,
      denomination,
      "0x0000000000000000000000000000000000000000",
      "0x145f040dbcdff4cbe8debbd58861296012fcb269",
      sender
    );
    handleUpdateFeed(secondConfirmedPriceFeed);
    assert.fieldEquals("PriceDataFeed", "0x145f040dbcdff4cbe8debbd58861296012fcb269", "live", "false");
  });
});
