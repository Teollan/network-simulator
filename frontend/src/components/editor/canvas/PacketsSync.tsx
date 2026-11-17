import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Edge } from '@xyflow/react';
import type { EdgePacket, FloatingEdgeData } from '@/components/editor/canvas/edge/edge.types';
import { usePlaybackClockStore } from '@/stores/usePlaybackClockStore';
import { usePlaybackStore } from '@/stores/usePlaybackStore';

interface PacketsSyncProps {
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

// a leaf that re-renders on every animation frame,
// so the rest of the canvas doesn't have to
export const PacketsSync = ({ setEdges }: PacketsSyncProps) => {
  const { time } = usePlaybackClockStore();
  const { timeline } = usePlaybackStore();

  useEffect(() => {
    const framesInFlightByLinkId = timeline?.snapshotAt(time).framesInFlightByLinkId;

    setEdges((edges) => edges.map((edge) => {
      const previousPackets = (edge.data as FloatingEdgeData | undefined)?.packets ?? [];
      const framesInFlight = framesInFlightByLinkId?.get(Number(edge.id)) ?? [];

      // keeps the same edge object, so React Flow skips re-rendering idle edges
      if (!previousPackets.length && !framesInFlight.length) {
        return edge;
      }

      const packets = framesInFlight.map<EdgePacket>(({ frame, progress }) => ({
        id: frame.packet.id,
        progress: frame.source.id === Number(edge.source) ? progress : 1 - progress,
      }));

      return {
        ...edge,
        data: {
          ...edge.data,
          packets,
        },
      };
    }));
  }, [time, timeline, setEdges]);

  return null;
};
