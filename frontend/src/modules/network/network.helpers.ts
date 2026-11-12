import { type Link } from '@/modules/network/Link';

export const isLinkWith = (nodeId: number) => {
  return (link: Link) => (
    link.sourceId === nodeId || link.targetId === nodeId
  );
};

export const getLinkComplement = (nodeId: number) => {
  return (link: Link) => {
    if (link.sourceId === nodeId) {
      return link.targetId;
    } else if (link.targetId === nodeId) {
      return link.sourceId;
    } else {
      throw Error(`Link [${link.id} does not connect node [${nodeId}]]`);
    }
  };
};
