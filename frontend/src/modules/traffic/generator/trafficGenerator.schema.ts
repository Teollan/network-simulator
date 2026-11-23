import { z } from 'zod';
import type { TrafficGeneratorConfig } from '@/modules/traffic/generator/generator.typedefs';

const nodeIdSchema = z.int('Pick a workstation');
const messageSizeSchema = z.int('Must be a whole number').positive('Must be at least 1');

const destinationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('constant'),
    destinationId: nodeIdSchema,
  }),
  z.object({
    kind: z.literal('uniform'),
  }),
]);

const sizeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('constant'),
    size: messageSizeSchema,
  }),
  z.object({
    kind: z.literal('range'),
    min: messageSizeSchema,
    max: messageSizeSchema,
  }).refine(({
    min,
    max,
  }) => min <= max, {
    message: 'Must not be less than min',
    path: ['max'],
  }),
]);

const transmissionSchema = z.object({
  time: z.number('Must be a number').nonnegative('Must not be negative'),
  destinationId: nodeIdSchema,
  size: messageSizeSchema,
});

export const trafficGeneratorSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('periodic'),
    sourceId: nodeIdSchema,
    period: z.number('Must be a number').positive('Must be positive'),
    phase: z.number('Must be a number').nonnegative('Must not be negative'),
    destination: destinationSchema,
    size: sizeSchema,
  }),
  z.object({
    kind: z.literal('poisson'),
    sourceId: nodeIdSchema,
    rate: z.number('Must be a number').positive('Must be positive'),
    destination: destinationSchema,
    size: sizeSchema,
  }),
  z.object({
    kind: z.literal('scripted'),
    sourceId: nodeIdSchema,
    transmissions: z.array(transmissionSchema)
      .min(1, 'Add at least one message')
      .transform((transmissions) => transmissions.toSorted((a, b) => a.time - b.time)),
  }),
]).superRefine((config, ctx) => {
  if (config.kind === 'scripted') {
    config.transmissions.forEach(({ destinationId }, idx) => {
      if (destinationId === config.sourceId) {
        ctx.addIssue({
          code: 'custom',
          message: 'Must differ from the source',
          path: ['transmissions', idx, 'destinationId'],
        });
      }
    });
  } else if (config.destination.kind === 'constant' && config.destination.destinationId === config.sourceId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Must differ from the source',
      path: ['destination', 'destinationId'],
    });
  }
}) satisfies z.ZodType<TrafficGeneratorConfig>;
