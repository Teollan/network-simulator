import {
  describe,
  expect,
  it,
} from 'vitest';
import { Network } from '@/modules/network/Network';
import {
  LINK_TYPE,
  type LinkType,
} from '@/modules/network/Link';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import type { RoutingPolicy } from '@/modules/routing/RoutingPolicy';
import { Simulation } from '@/modules/simulation/Simulation';
import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { PacketFactoryConfig } from '@/modules/traffic/PacketFactory';
import type { TrafficGeneratorConfig } from '@/modules/traffic/generator/generator.typedefs';

const MESSAGE_SIZE = 30;

const PACKETS: PacketFactoryConfig = {
  maxSize: 10,
  maxHops: 10,
};

const SEED = 1;

const PACKETS_PER_MESSAGE = Math.ceil(MESSAGE_SIZE / PACKETS.maxSize);

// a single message at t = 0, from source to destination
const oneMessage = (sourceId: number, destinationId: number): TrafficGeneratorConfig => ({
  kind: 'scripted',
  sourceId,
  transmissions: [{
    time: 0,
    destinationId,
    size: MESSAGE_SIZE,
  }],
});

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
    seed: SEED,
    network,
    routing: directRouting,
    packets: PACKETS,
    traffic: {
      generators: [
        oneMessage(a.id, b.id),
        oneMessage(b.id, a.id),
      ],
    },
  });

  simulation.run();

  return simulation;
};

const ofKind = <K extends SimulationEvent['kind']>(trace: readonly SimulationEvent[], kind: K) => (
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
      seed: SEED,
      network,
      routing: directRouting,
      packets: PACKETS,
      traffic: {
        generators: [
          oneMessage(a.id, b.id),
        ],
      },
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

describe('Simulation: hop limit', () => {
  // static next hops for the A -> B -> C chain, so the test doesn't depend on a real routing policy
  const NEXT_HOP_BY_LABEL: Record<string, string> = {
    A: 'B',
    B: 'C',
  };

  const chainRouting: RoutingPolicy = {
    route: ({ thisNode }) => (
      thisNode.getAdjacentNodes().filter((node) => node.label === NEXT_HOP_BY_LABEL[thisNode.label])
    ),
  };

  // A -> B -> C, with B as a transit router two hops away from the destination
  const runChain = (maxHops: number) => {
    const network = new Network();
    const region = network.createRegion({ label: 'R' });

    const [a, b, c] = network.createManyNodes([
      {
        label: 'A',
        regionId: region.id,
        type: NODE_TYPE.WORKSTATION,
      },
      {
        label: 'B',
        regionId: region.id,
        type: NODE_TYPE.ROUTER,
      },
      {
        label: 'C',
        regionId: region.id,
        type: NODE_TYPE.WORKSTATION,
      },
    ]);

    network.createManyLinks([
      {
        sourceId: a.id,
        targetId: b.id,
      },
      {
        sourceId: b.id,
        targetId: c.id,
      },
    ]);

    const simulation = new Simulation({
      seed: SEED,
      network,
      routing: chainRouting,
      packets: {
        ...PACKETS,
        maxHops,
      },
      traffic: {
        generators: [
          oneMessage(a.id, c.id),
        ],
      },
    });

    simulation.run();

    return simulation;
  };

  it('should drop every packet at the transit router when maxHops is 1', () => {
    const { trace, pendingEventCount } = runChain(1);
    const dropped = ofKind(trace, SIMULATION_EVENT_KIND.PACKET_DROPPED);

    expect(pendingEventCount).toBe(0);
    expect(dropped).toHaveLength(PACKETS_PER_MESSAGE);

    for (const { data } of dropped) {
      expect(data.reason).toBe(PACKET_DROP_REASON.HOP_LIMIT);
      expect(data.thisNode.label).toBe('B');
    }
  });

  it('should never forward a packet past the transit router when maxHops is 1', () => {
    const { trace } = runChain(1);

    const reachedC = ofKind(trace, SIMULATION_EVENT_KIND.PACKET_RECEIVED).filter(({ data }) => (
      data.thisNode.label === 'C'
    ));

    expect(reachedC).toHaveLength(0);
    expect(ofKind(trace, SIMULATION_EVENT_KIND.MESSAGE_RECEIVED)).toHaveLength(0);
  });

  it('should deliver the message when maxHops covers both hops', () => {
    const { trace } = runChain(2);

    expect(ofKind(trace, SIMULATION_EVENT_KIND.PACKET_DROPPED)).toHaveLength(0);
    expect(ofKind(trace, SIMULATION_EVENT_KIND.MESSAGE_RECEIVED).map(({ data }) => data.thisNode.label)).toEqual(['C']);
  });
});

describe('Simulation: periodic traffic', () => {
  const PERIOD = 5;
  const RUN_UNTIL = 12;

  // A sends to B every PERIOD from t = 0, so the run sees sends at 0, 5 and 10
  const runPeriodic = () => {
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
      },
    ]);

    const simulation = new Simulation({
      seed: SEED,
      network,
      routing: directRouting,
      packets: PACKETS,
      traffic: {
        generators: [{
          kind: 'periodic',
          sourceId: a.id,
          period: PERIOD,
          phase: 0,
          destination: {
            kind: 'constant',
            destinationId: b.id,
          },
          size: {
            kind: 'constant',
            size: MESSAGE_SIZE,
          },
        }],
      },
    });

    simulation.run(RUN_UNTIL);

    return simulation;
  };

  it('should send a message every period up to the run limit', () => {
    const sent = ofKind(runPeriodic().trace, SIMULATION_EVENT_KIND.MESSAGE_SENT);

    expect(sent.map(({ time }) => time)).toEqual([0, 5, 10]);
  });

  it('should give every generated message a fresh id', () => {
    const sent = ofKind(runPeriodic().trace, SIMULATION_EVENT_KIND.MESSAGE_SENT);

    expect(sent.map(({ data }) => data.message.id)).toEqual([1, 2, 3]);
  });

  it('should send every message from the generator source to its destination', () => {
    const sent = ofKind(runPeriodic().trace, SIMULATION_EVENT_KIND.MESSAGE_SENT);

    for (const { data } of sent) {
      expect(data.source.label).toBe('A');
      expect(data.destination.label).toBe('B');
      expect(data.message.size).toBe(MESSAGE_SIZE);
    }
  });

  it('should keep exactly one send pending past the run limit', () => {
    const pendingSends = ofKind(runPeriodic().pendingEvents, SIMULATION_EVENT_KIND.MESSAGE_SENT);

    expect(pendingSends.map(({ time }) => time)).toEqual([15]);
  });
});

describe('Simulation: poisson traffic', () => {
  const RATE = 0.05;
  const RUN_UNTIL = 20_000;
  // ~1000 arrivals: the sample mean is within ~3 standard errors of the expected one
  const TOLERANCE = 0.1;

  // A sends to B or C, picked uniformly, at Poisson arrivals with RATE
  const runPoisson = (seed = SEED) => {
    const network = new Network();
    const region = network.createRegion({ label: 'R' });

    const [a, b, c] = network.createManyNodes([
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
      {
        label: 'C',
        regionId: region.id,
        type: NODE_TYPE.WORKSTATION,
      },
    ]);

    network.createManyLinks([
      {
        sourceId: a.id,
        targetId: b.id,
      },
      {
        sourceId: a.id,
        targetId: c.id,
      },
    ]);

    const simulation = new Simulation({
      seed,
      network,
      routing: directRouting,
      packets: PACKETS,
      traffic: {
        generators: [{
          kind: 'poisson',
          sourceId: a.id,
          rate: RATE,
          destination: { kind: 'uniform' },
          size: {
            kind: 'constant',
            size: MESSAGE_SIZE,
          },
        }],
      },
    });

    simulation.run(RUN_UNTIL);

    return simulation;
  };

  const sendTimes = (simulation: Simulation) => (
    ofKind(simulation.trace, SIMULATION_EVENT_KIND.MESSAGE_SENT).map(({ time }) => time)
  );

  it('should produce the same arrivals for the same seed', () => {
    expect(sendTimes(runPoisson())).toEqual(sendTimes(runPoisson()));
  });

  it('should produce different arrivals for a different seed', () => {
    expect(sendTimes(runPoisson(SEED + 1))).not.toEqual(sendTimes(runPoisson()));
  });

  it('should send the first message after t = 0', () => {
    expect(sendTimes(runPoisson())[0]).toBeGreaterThan(0);
  });

  it('should send about RATE * RUN_UNTIL messages', () => {
    const expected = RATE * RUN_UNTIL;

    expect(Math.abs(sendTimes(runPoisson()).length - expected)).toBeLessThan(expected * TOLERANCE);
  });

  it('should space arrivals by about 1 / RATE on average', () => {
    const times = sendTimes(runPoisson());
    const gaps = times.slice(1).map((time, idx) => time - times[idx]);
    const meanGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    expect(Math.abs(meanGap - 1 / RATE)).toBeLessThan(TOLERANCE / RATE);
  });

  it('should pick destinations uniformly among the other workstations, never the source', () => {
    const sent = ofKind(runPoisson().trace, SIMULATION_EVENT_KIND.MESSAGE_SENT);
    const toB = sent.filter(({ data }) => data.destination.label === 'B').length;
    const toC = sent.filter(({ data }) => data.destination.label === 'C').length;

    expect(sent.some(({ data }) => data.destination === data.source)).toBe(false);
    expect(toB + toC).toBe(sent.length);
    expect(Math.abs(toB - toC)).toBeLessThan(sent.length * TOLERANCE);
  });
});
