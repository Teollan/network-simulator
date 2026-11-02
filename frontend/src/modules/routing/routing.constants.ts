export const ROUTING_POLICY = {
  HOT_POTATO: 'hot-potato',
} as const;

export type RoutingPolicyId = typeof ROUTING_POLICY[keyof typeof ROUTING_POLICY];

export const ROUTING_POLICY_LABEL: Record<RoutingPolicyId, string> = {
  [ROUTING_POLICY.HOT_POTATO]: 'Hot potato (shortest queue)',
};
