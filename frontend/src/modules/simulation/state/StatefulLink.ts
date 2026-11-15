import { LINK_TYPE, type Link } from '@/modules/network/Link';
import { isLinkWith } from '@/modules/network/network.helpers';

export interface StatefulHalfDuplexLink extends Link {
  type: typeof LINK_TYPE.HALF_DUPLEX;
  isBusy: boolean;
}

export interface StatefulFullDuplexLink extends Link {
  type: typeof LINK_TYPE.FULL_DUPLEX;
  isBusy: {
    direct: boolean;
    inverse: boolean;
  };
}

export type StatefulLink = StatefulHalfDuplexLink | StatefulFullDuplexLink;

export const isLinkBusy = (link: StatefulLink, sourceId: number): boolean => {
  if (!isLinkWith(sourceId)(link)) {
    throw Error(`Link is not connected to node [${sourceId}]!`);
  }

  switch (link.type) {
    case LINK_TYPE.HALF_DUPLEX:
      return link.isBusy;

    case LINK_TYPE.FULL_DUPLEX:
      if (link.sourceId === sourceId) {
        return link.isBusy.direct;
      } else {
        return link.isBusy.inverse;
      }
  }
};
