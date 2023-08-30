import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { AccessControllerSet } from "../generated/schema"
import { AccessControllerSet as AccessControllerSetEvent } from "../generated/FeedRegistry/FeedRegistry"
import { handleAccessControllerSet } from "../src/feed-registry"
import { createAccessControllerSetEvent } from "./feed-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let accessController = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAccessControllerSetEvent = createAccessControllerSetEvent(
      accessController,
      sender
    )
    handleAccessControllerSet(newAccessControllerSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AccessControllerSet created and stored", () => {
    assert.entityCount("AccessControllerSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AccessControllerSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "accessController",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AccessControllerSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "sender",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
