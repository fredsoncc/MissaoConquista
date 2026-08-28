export type PlayerId = "cyan" | "violet" | "amber" | "neutral";
export type Phase = "planning" | "resolution" | "victory";

export type Planet = {
  id: string;
  name: string;
  x: number;
  y: number;
  owner: PlayerId;
  ships: number;
  production: number;
  neighbors: string[];
};

export type Fleet = {
  id: string;
  from: string;
  to: string;
  owner: PlayerId;
  ships: number;
  eta: number;
};

export type GameState = {
  turn: number;
  activePlayer: PlayerId;
  phase: Phase;
  winner: PlayerId | null;
  planets: Planet[];
  fleets: Fleet[];
};

const playerOrder: PlayerId[] = ["cyan", "violet"];

export const initialPlanets: Planet[] = [
  { id: "sol", name: "Sol", x: 50, y: 50, owner: "cyan", ships: 18, production: 5, neighbors: ["vega", "rigel", "nova"] },
  { id: "vega", name: "Vega", x: 27, y: 27, owner: "neutral", ships: 10, production: 3, neighbors: ["sol", "orion", "lyra"] },
  { id: "rigel", name: "Rigel", x: 76, y: 24, owner: "neutral", ships: 13, production: 4, neighbors: ["sol", "orion", "sirius"] },
  { id: "nova", name: "Nova-7", x: 25, y: 75, owner: "neutral", ships: 8, production: 2, neighbors: ["sol", "lyra", "sirius"] },
  { id: "orion", name: "Orion", x: 72, y: 70, owner: "violet", ships: 16, production: 5, neighbors: ["rigel", "vega", "sirius"] },
  { id: "lyra", name: "Lyra", x: 50, y: 16, owner: "neutral", ships: 7, production: 2, neighbors: ["vega", "nova", "sirius"] },
  { id: "sirius", name: "Sirius", x: 84, y: 50, owner: "neutral", ships: 9, production: 3, neighbors: ["rigel", "nova", "orion", "lyra"] },
];

export function createInitialGame(): GameState {
  return { turn: 1, activePlayer: "cyan", phase: "planning", winner: null, planets: initialPlanets.map((planet) => ({ ...planet })), fleets: [] };
}

export function ownedPlanets(state: GameState, player: PlayerId) {
  return state.planets.filter((planet) => planet.owner === player);
}

export function canSendFleet(state: GameState, fromId: string, toId: string, ships: number) {
  const from = state.planets.find((planet) => planet.id === fromId);
  const to = state.planets.find((planet) => planet.id === toId);
  return Boolean(from && to && from.owner === state.activePlayer && from.neighbors.includes(toId) && ships > 0 && ships <= from.ships);
}

export function sendFleet(state: GameState, fromId: string, toId: string, ships: number): GameState {
  if (!canSendFleet(state, fromId, toId, ships)) return state;
  return {
    ...state,
    planets: state.planets.map((planet) => planet.id === fromId ? { ...planet, ships: planet.ships - ships } : planet),
    fleets: [...state.fleets, { id: `${fromId}-${toId}-${state.turn}-${Date.now()}`, from: fromId, to: toId, owner: state.activePlayer, ships, eta: 1 }],
  };
}

function resolveFleet(state: GameState, fleet: Fleet): GameState {
  const target = state.planets.find((planet) => planet.id === fleet.to);
  if (!target) return state;
  const delta = fleet.owner === target.owner ? fleet.ships : -fleet.ships;
  const nextShips = target.ships + delta;
  const conquered = nextShips < 0;
  return {
    ...state,
    planets: state.planets.map((planet) => planet.id === target.id ? { ...planet, owner: conquered ? fleet.owner : planet.owner, ships: Math.abs(nextShips) } : planet),
  };
}

export function endTurn(state: GameState): GameState {
  if (state.phase === "victory") return state;
  let next: GameState = {
    ...state,
    turn: state.turn + 1,
    activePlayer: playerOrder[(playerOrder.indexOf(state.activePlayer) + 1) % playerOrder.length],
    planets: state.planets.map((planet) => planet.owner === state.activePlayer ? { ...planet, ships: planet.ships + planet.production } : planet),
    fleets: [],
  };
  state.fleets.forEach((fleet) => { next = resolveFleet(next, fleet); });
  const cyan = ownedPlanets(next, "cyan").length;
  const violet = ownedPlanets(next, "violet").length;
  if (cyan === 0 || violet === 0) next = { ...next, phase: "victory", winner: cyan > 0 ? "cyan" : "violet" };
  return next;
}

export function playerLabel(player: PlayerId) {
  return player === "cyan" ? "Aliança Ciano" : player === "violet" ? "Império Violeta" : "Neutro";
}
