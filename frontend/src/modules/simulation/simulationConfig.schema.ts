import { z } from 'zod';
import { ROUTING_POLICY } from '@/modules/routing/routing.constants';

export const simulationConfigSchema = z.object({
  routingPolicyId: z.enum(ROUTING_POLICY),
  runUntil: z.number('Must be a number').nonnegative('Must not be negative'),
  maxPacketSize: z.int('Must be a whole number').positive('Must be at least 1'),
  maxHops: z.int('Must be a whole number').positive('Must be at least 1'),
});

export type SimulationConfig = z.infer<typeof simulationConfigSchema>;
