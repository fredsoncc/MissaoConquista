import { describe, expect, it } from "vitest";
import { createInitialGame, endTurn, sendFleet } from "./engine";

describe("MissaoConquista engine", () => {
  it("sends a valid fleet and removes ships from the origin", () => {
    const initial = createInitialGame();
    const next = sendFleet(initial, "sol", "vega", 5);
    expect(next).not.toBe(initial);
    expect(next.planets.find((planet) => planet.id === "sol")?.ships).toBe(13);
    expect(next.fleets[0]).toMatchObject({ from: "sol", to: "vega", ships: 5, owner: "cyan" });
  });

  it("rejects a route from a planet the player does not own", () => {
    const initial = createInitialGame();
    expect(sendFleet(initial, "orion", "rigel", 2)).toBe(initial);
  });

  it("produces ships and alternates the active player at end of turn", () => {
    const initial = createInitialGame();
    const next = endTurn(initial);
    expect(next.activePlayer).toBe("violet");
    expect(next.turn).toBe(2);
    expect(next.planets.find((planet) => planet.id === "sol")?.ships).toBe(23);
  });
});
