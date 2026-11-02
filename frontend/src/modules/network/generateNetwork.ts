import { Network } from '@/modules/network/Network';

// TODO: multiple regions, once satellite links can connect them
const REGION = 'us';

export interface NetworkConfig {
  routersPerRegion: number;
  averageDegree: number;
  weightPool: number[];
}

export const generateNetwork = ({ routersPerRegion, averageDegree, weightPool }: NetworkConfig) => {
  const network = new Network();

  network.spawn(routersPerRegion, REGION);
  network.connect(averageDegree, (node) => node.label.startsWith(REGION), weightPool);

  return network;
};
