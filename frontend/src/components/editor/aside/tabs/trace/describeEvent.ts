import {
  ArrowDownToLine,
  ArrowRight,
  CircleCheck,
  CircleX,
  ListPlus,
  MailCheck,
  PackagePlus,
  Radio,
  Route,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';

export interface EventDescription {
  icon: LucideIcon;
  title: string;
  isError?: boolean;
}

export const describeEvent = (
  event: SimulationEvent,
  getLabel: (nodeId: number) => string,
): EventDescription => {
  switch (event.kind) {
    case SIMULATION_EVENT_KIND.MESSAGE_SENT: {
      const { message, source, destination } = event.data;

      return {
        icon: Send,
        title: `message ${message.id} sent ${getLabel(source.id)} → ${getLabel(destination.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.MESSAGE_RECEIVED: {
      const { message, thisNode } = event.data;

      return {
        icon: MailCheck,
        title: `message ${message.id} received at ${getLabel(thisNode.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_SENT: {
      const { packet, from, thisNode } = event.data;

      if (!from) {
        return {
          icon: PackagePlus,
          title: `packet #${packet.id} created at ${getLabel(thisNode.id)}`,
        };
      }

      return {
        icon: Route,
        title: `packet #${packet.id} routed at ${getLabel(thisNode.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_RECEIVED: {
      const { packet, thisNode } = event.data;

      if (packet.destination === thisNode) {
        return {
          icon: CircleCheck,
          title: `packet #${packet.id} delivered to ${getLabel(thisNode.id)}`,
        };
      }

      return {
        icon: ArrowDownToLine,
        title: `packet #${packet.id} received at ${getLabel(thisNode.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_DROPPED: {
      const { packet, thisNode, reason } = event.data;

      return {
        icon: CircleX,
        title: `packet #${packet.id} dropped at ${getLabel(thisNode.id)}: ${reason}`,
        isError: true,
      };
    }

    case SIMULATION_EVENT_KIND.FRAME_FORWARDED: {
      const { packet, source, destination } = event.data.frame;

      return {
        icon: ListPlus,
        title: `packet #${packet.id} queued ${getLabel(source.id)} → ${getLabel(destination.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.FRAME_SENT: {
      const { packet, source, destination } = event.data.frame;

      return {
        icon: Radio,
        title: `packet #${packet.id} transmitted ${getLabel(source.id)} → ${getLabel(destination.id)}`,
      };
    }

    case SIMULATION_EVENT_KIND.FRAME_RECEIVED: {
      const { packet, source, destination } = event.data.frame;

      return {
        icon: ArrowRight,
        title: `packet #${packet.id} arrived ${getLabel(source.id)} → ${getLabel(destination.id)}`,
      };
    }
  }
};
