import { HotPotatoRP } from '@/modules/routing/HotPotatoRP';
import type { RoutingPolicy } from '@/modules/routing/RoutingPolicy';
import { ROUTING_POLICY, type RoutingPolicyId } from '@/modules/routing/routing.constants';

export const createRoutingPolicy = (policyId: RoutingPolicyId): RoutingPolicy<unknown> => {
  switch (policyId) {
    case ROUTING_POLICY.HOT_POTATO:
      return new HotPotatoRP();
  }
};
