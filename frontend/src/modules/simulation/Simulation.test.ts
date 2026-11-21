import { describe, expect, it } from 'vitest';
import { Network } from '@/modules/network/Network';
import { LINK_TYPE, type LinkType } from '@/modules/network/Link';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import type { RoutingPolicy } from '@/modules/routing/RoutingPolicy';
import { Simulation } from '@/modules/simulation/Simulation';
import { PACKET_DROP_REASON, SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';

const MESSAGE_SIZE = 30;
const PACKETS_PER_MESSAGE = 3;

// deterministic stub, so routing randomness can't leak into simulation tests:
// forward straight to the destination if it is adjacent, otherwise give up
const directRouting: RoutingPolicy = {
  route: ({ thisNode, destination }) => (
    thisNode.getAdjacentNodes().filter((node) => node === destination)
  ),
};

const runExchange = (linkType: LinkType) => {
  const network = new Network();
  const region = network.createRegion({ label: 'R' });

  const [a, b] = network.createManyNodes([
    {
      label: 'A',
      regionId: region.id,
      type: NODE_TYPE.WORKSTATION,
    },
    {
      label: 'B',
      regionId: region.id,
      type: NODE_TYPE.WORKSTATION,
    },
  ]);

  network.createManyLinks([
    {
      sourceId: a.id,
      targetId: b.id,
      type: linkType,
    },
  ]);

  const simulation = new Simulation({
    network,
    routingPolicy: directRouting,
    traffic: [
      {
        message: {
          id: 1,
          size: MESSAGE_SIZE,
        },
        sourceId: a.id,
        destinationId: b.id,
        time: 0,
      },
      {
        message: {
          id: 2,
          size: MESSAGE_SIZE,
        },
        sourceId: b.id,
        destinationId: a.id,
        time: 0,
      },
    ],
  });

  simulation.run();

  return simulation;
};

const ofKind = <K extends SimulationEvent['kind']>(trace: SimulationEvent[], kind: K) => (
  trace.filter((event): event is Extract<SimulationEvent, { kind: K }> => event.kind === kind)
);

interface Transmission {
  direction: string;
  packetId: number;
  start: number;
  end: number;
}

// pairs each FRAME_SENT with the FRAME_RECEIVED of the same packet over the same hop
const getTransmissions = (trace: SimulationEvent[]): Transmission[] => {
  const received = ofKind(trace, SIMULATION_EVENT_KIND.FRAME_RECEIVED);

  return ofKind(trace, SIMULATION_EVENT_KIND.FRAME_SENT).map(({ data, time }) => {
    const { frame } = data;
    const arrival = received.find((event) => (
      event.data.frame.packet.id === frame.packet.id
      && event.data.frame.source === frame.source
      && event.data.frame.destination === frame.destination
    ));

    if (!arrival) {
      throw Error(`Frame with packet #${frame.packet.id} never arrived!`);
    }

    return {
      direction: `${frame.source.label}->${frame.destination.label}`,
      packetId: frame.packet.id,
      start: time,
      end: arrival.time,
    };
  });
};

const overlaps = (x: Transmission, y: Transmission) => x.start < y.end && y.start < x.end;

// TODO: cover the hop limit, e.g. an A -> B -> C chain with maxHops: 1
// should drop at B with PACKET_DROP_REASON.HOP_LIMIT and never reach C;
// needs MAX_HOPS to become a SimulationConfig option instead of a constant

describe('Simulation: A <-> B exchange', () => {
  describe.each([LINK_TYPE.FULL_DUPLEX, LINK_TYPE.HALF_DUPLEX])('over a %s link', (linkType) => {
    it('should run to completion without errors', () => {
      expect(() => runExchange(linkType)).not.toThrow();
      expect(runExchange(linkType).pendingEventCount).toBe(0);
    });

    it('should reassemble both messages at their destinations', () => {
      const { trace } = runExchange(linkType);

      const received = ofKind(trace, SIMULATION_EVENT_KIND.MESSAGE_RECEIVED).map(({ data }) => (
        `${data.message.id}@${data.thisNode.label}`
      ));

      expect(received.sort()).toEqual(['1@B', '2@A']);
    });

    it('should deliver every packet without drops', () => {
      const { trace } = runExchange(linkType);

      const delivered = ofKind(trace, SIMULATION_EVENT_KIND.PACKET_RECEIVED).filter(({ data }) => (
        data.packet.destination === data.thisNode
      ));

      expect(delivered).toHaveLength(2 * PACKETS_PER_MESSAGE);
      expect(ofKind(trace, SIMULATION_EVENT_KIND.PACKET_DROPPED)).toHaveLength(0);
    });

    it('should transmit frames in FIFO order per direction', () => {
      const transmissions = getTransmissions(runExchange(linkType).trace);

      for (const direction of ['A->B', 'B->A']) {
        const ids = transmissions
          .filter((transmission) => transmission.direction === direction)
          .map(({ packetId }) => packetId);

        expect(ids).toEqual([...ids].sort((x, y) => x - y));
      }
    });

    it('should never put two frames in flight in the same direction', () => {
      const transmissions = getTransmissions(runExchange(linkType).trace);

      for (const x of transmissions) {
        for (const y of transmissions) {
          if (x !== y && x.direction === y.direction) {
            expect(overlaps(x, y)).toBe(false);
          }
        }
      }
    });
  });

  describe('over a full-duplex link', () => {
    it('should transmit in both directions at the same time', () => {
      const transmissions = getTransmissions(runExchange(LINK_TYPE.FULL_DUPLEX).trace);

      const forward = transmissions.filter(({ direction }) => direction === 'A->B');
      const backward = transmissions.filter(({ direction }) => direction === 'B->A');

      expect(forward.some((x) => backward.some((y) => overlaps(x, y)))).toBe(true);
    });
  });

  describe('over a half-duplex link', () => {
    it('should never transmit in both directions at the same time', () => {
      const transmissions = getTransmissions(runExchange(LINK_TYPE.HALF_DUPLEX).trace);

      for (const x of transmissions) {
        for (const y of transmissions) {
          if (x !== y) {
            expect(overlaps(x, y)).toBe(false);
          }
        }
      }
    });

    it('should alternate directions while both sides have frames queued', () => {
      const directions = getTransmissions(runExchange(LINK_TYPE.HALF_DUPLEX).trace)
        .sort((x, y) => x.start - y.start)
        .map(({ direction }) => direction);

      expect(directions).toEqual(['A->B', 'B->A', 'A->B', 'B->A', 'A->B', 'B->A']);
    });

    it('should take longer than the same exchange over a full-duplex link', () => {
      const halfDuplex = runExchange(LINK_TYPE.HALF_DUPLEX);
      const fullDuplex = runExchange(LINK_TYPE.FULL_DUPLEX);

      expect(halfDuplex.time).toBeGreaterThan(fullDuplex.time);
    });
  });
});

describe('Simulation: buffer overflow', () => {
  // A -> B only, with a single-frame output queue at A: all 3 packets reach
  // A's interface at the same time, so only the first one fits
  const runOverflow = () => {
    const network = new Network();
    const region = network.createRegion({ label: 'R' });

    const [a, b] = network.createManyNodes([
      {
        label: 'A',
        regionId: region.id,
        type: NODE_TYPE.WORKSTATION,
        bufferSize: { default: 1 },
      },
      {
        label: 'B',
        regionId: region.id,
        type: NODE_TYPE.WORKSTATION,
      },
    ]);

    network.createManyLinks([
      {
        sourceId: a.id,
        targetId: b.id,
      },
    ]);

    const simulation = new Simulation({
      network,
      routingPolicy: directRouting,
      traffic: [
        {
          message: {
            id: 1,
            size: MESSAGE_SIZE,
          },
          sourceId: a.id,
          destinationId: b.id,
          time: 0,
        },
      ],
    });

    simulation.run();

    return simulation;
  };

  it('should drop packets that do not fit into the output queue instead of throwing', () => {
    expect(() => runOverflow()).not.toThrow();
    expect(runOverflow().pendingEventCount).toBe(0);
  });

  it('should drop the overflowing packets at the source with BUFFER_OVERFLOW', () => {
    const dropped = ofKind(runOverflow().trace, SIMULATION_EVENT_KIND.PACKET_DROPPED);

    expect(dropped).toHaveLength(PACKETS_PER_MESSAGE - 1);

    for (const { data } of dropped) {
      expect(data.reason).toBe(PACKET_DROP_REASON.BUFFER_OVERFLOW);
      expect(data.thisNode.label).toBe('A');
    }
  });

  it('should account for every packet as either delivered or dropped', () => {
    const { trace } = runOverflow();

    const delivered = ofKind(trace, SIMULATION_EVENT_KIND.PACKET_RECEIVED).filter(({ data }) => (
      data.packet.destination === data.thisNode
    ));
    const dropped = ofKind(trace, SIMULATION_EVENT_KIND.PACKET_DROPPED);

    expect(delivered).toHaveLength(1);
    expect(delivered.length + dropped.length).toBe(PACKETS_PER_MESSAGE);
  });

  it('should not reassemble a message that lost packets', () => {
    expect(ofKind(runOverflow().trace, SIMULATION_EVENT_KIND.MESSAGE_RECEIVED)).toHaveLength(0);
  });
});
