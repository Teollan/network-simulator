import {
  ArrowDownToLine,
  ArrowRight,
  CircleCheck,
  CircleX,
  MailCheck,
  PackagePlus,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/SimulationEvent';

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
      const { message, fromNodeId, toNodeId } = event.data;

      return {
        icon: Send,
        title: `message ${message.id} sent ${getLabel(fromNodeId)} → ${getLabel(toNodeId)}`,
      };
    }

    case SIMULATION_EVENT_KIND.MESSAGE_RECEIVED: {
      const { message, nodeId } = event.data;

      return {
        icon: MailCheck,
        title: `message ${message.id} received at ${getLabel(nodeId)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_CREATED: {
      const { packet } = event.data;

      return {
        icon: PackagePlus,
        title: `packet #${packet.id} created at ${getLabel(packet.sourceId)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_SENT: {
      const { packet, sourceId, destinationId } = event.data.frame;

      return {
        icon: ArrowRight,
        title: `packet #${packet.id} sent ${getLabel(sourceId)} → ${getLabel(destinationId)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_RECEIVED: {
      const { packet, destinationId } = event.data.frame;

      if (packet.destinationId === destinationId) {
        return {
          icon: CircleCheck,
          title: `packet #${packet.id} delivered to ${getLabel(destinationId)}`,
        };
      }

      return {
        icon: ArrowDownToLine,
        title: `packet #${packet.id} received at ${getLabel(destinationId)}`,
      };
    }

    case SIMULATION_EVENT_KIND.PACKET_DROPPED: {
      const { packet, nodeId, reason } = event.data;

      return {
        icon: CircleX,
        title: `packet #${packet.id} dropped at ${getLabel(nodeId)}: ${reason}`,
        isError: true,
      };
    }
  }
};
