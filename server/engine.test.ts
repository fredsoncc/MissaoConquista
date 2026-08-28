import { describe, expect, it } from "vitest";
import { createInitialGame, endTurn, sendFleet } from "../client/src/game/engine";

describe("MissaoConquista engine", () => {
  it("sends a valid fleet and removes ships from the origin", () => {
    const initial = createInitialGame();
    const next = sendFleet(initial, "sol", "vega", 5);
    expect(next.planets.find((planet) => planet.id === "sol")?.ships).toBe(13);
    expect(next.fleets[0]).toMatchObject({ from: "sol", to: "vega", ships: 5, owner: "cyan" });
  });
  it("rejects a route from a planet the player does not own", () => expect(sendFleet(createInitialGame(), "orion", "rigel", 2)).toEqual(createInitialGame()));
  it("rejects a non-neighbor target and an excessive fleet", () => { const initial = createInitialGame(); expect(sendFleet(initial, "sol", "orion", 2)).toEqual(initial); expect(sendFleet(initial, "sol", "vega", 99)).toEqual(initial); });
  it("produces ships and alternates the active player", () => { const next = endTurn(createInitialGame()); expect(next.activePlayer).toBe("violet"); expect(next.turn).toBe(2); expect(next.planets.find((planet) => planet.id === "sol")?.ships).toBe(23); });
});
