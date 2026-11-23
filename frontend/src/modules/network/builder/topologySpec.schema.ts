import { z } from 'zod';
import { LINK_MEDIUM } from '@/modules/network/Link';
import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
  type TopologySpec,
} from '@/modules/network/builder/TopologySpec';

const regionSchema = z.string().min(1, 'Pick a region');
const shareSchema = z.number('Must be a number').min(0, 'Must be within [0, 1]').max(1, 'Must be within [0, 1]');
const mediumSchema = z.enum(LINK_MEDIUM).optional();

const poolSchema = (isValid: (value: number) => boolean, message: string) => z
  .array(z.custom<number>((value) => typeof value === 'number', 'Must be a number'))
  .min(1, 'Must not be empty')
  .refine((pool) => pool.every(isValid), message);

const isPositiveInt = (value: number) => Number.isInteger(value) && value > 0;
const isNonNegativeInt = (value: number) => Number.isInteger(value) && value >= 0;

export const topologyBuilderActionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal(ACTION.CREATE_REGION),
    options: z.object({
      label: z.string().trim().min(1, 'Must not be empty'),
      size: z.int('Must be a whole number').positive('Must be at least 1'),
    }),
  }),
  z.object({
    kind: z.literal(ACTION.LINK_INSIDE_REGION),
    options: z.object({
      region: regionSchema,
      degree: z.number('Must be a number').nonnegative('Must not be negative'),
    }),
  }),
  z.object({
    kind: z.literal(ACTION.LINK_REGIONS),
    options: z.object({
      sourceRegion: regionSchema,
      targetRegion: regionSchema,
    }).refine(({
      sourceRegion,
      targetRegion,
    }) => sourceRegion !== targetRegion, {
      message: 'Must differ from the source region',
      path: ['targetRegion'],
    }),
  }),
  z.object({
    kind: z.literal(ACTION.ATTACH_WORKSTATIONS),
    options: z.object({
      region: regionSchema,
      every: z.int('Must be a whole number').positive('Must be at least 1'),
    }),
  }),
  z.object({
    kind: z.literal(ACTION.ASSIGN_LINK_WEIGHTS),
    options: z.object({
      pool: poolSchema(isPositiveInt, 'Weights must be positive whole numbers'),
    }),
  }),
  z.object({
    kind: z.literal(ACTION.ASSIGN_BIT_ERROR_RATE),
    options: z.object({
      value: shareSchema,
      medium: mediumSchema,
    }),
  }),
  z.object({
    kind: z.literal(ACTION.ASSIGN_LINK_TYPE),
    options: z.object({
      halfDuplexShare: shareSchema,
      medium: mediumSchema,
    }),
  }),
  z.object({
    kind: z.literal(ACTION.ASSIGN_BUFFER_SIZE),
    options: z.object({
      pool: poolSchema(isNonNegativeInt, 'Buffer sizes must be non-negative whole numbers'),
      medium: mediumSchema,
    }),
  }),
]) satisfies z.ZodType<TopologyBuilderAction>;

export const topologySpecSchema = z.object({
  seed: z.int('Must be a whole number').nonnegative('Must not be negative').optional(),
  actions: z.array(topologyBuilderActionSchema),
}) satisfies z.ZodType<TopologySpec>;
