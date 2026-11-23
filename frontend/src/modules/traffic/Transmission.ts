// TODO: looks like the entities are needlessly multiplying.
// Think of welding this into the Message.
export interface Transmission {
  time: number;
  destinationId: number;
  size: number;
}
