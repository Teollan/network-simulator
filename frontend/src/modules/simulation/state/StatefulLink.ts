import { LINK_TYPE, type Link, type LinkMedium, type LinkType } from '@/modules/network/Link';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export type IsBusy = boolean | {
  direct: boolean,
  reverse: boolean
}

export interface StatefulLink<B extends IsBusy = IsBusy> extends Link {
  isBusy: B;
  getProxy(source: StatefulNode): StatefulLink<boolean>
}

export class StatefulHalfDuplexLink implements StatefulLink<boolean> {
  readonly id: number;

  readonly sourceId: number;
  readonly targetId: number;

  readonly type: LinkType;
  readonly medium: LinkMedium;
  readonly weight: number;
  readonly bitErrorRate: number;

  isBusy = false;

  constructor(link: Omit<Link, 'type'> & { type: typeof LINK_TYPE.HALF_DUPLEX }) {
    this.id = link.id;

    this.sourceId = link.sourceId;
    this.targetId = link.targetId;

    this.type = link.type;
    this.medium = link.medium;
    this.weight = link.weight;
    this.bitErrorRate = link.bitErrorRate;
  }

  getProxy(source: StatefulNode): StatefulLink<boolean> {
    if (source.id !== this.sourceId && source.id !== this.targetId) {
      throw Error(`Node [${source.id}] does not belong to this link!`);
    }

    if (source.id === this.sourceId) {
      return new StatefulHalfDuplexLinkProxy(this, { isReverse: false });
    } else {
      return new StatefulHalfDuplexLinkProxy(this, { isReverse: true });
    }
  }
}

export class StatefulFullDuplexLink implements StatefulLink<{
  direct: boolean,
  reverse: boolean
}> {
  readonly id: number;

  readonly sourceId: number;
  readonly targetId: number;

  readonly type: LinkType;
  readonly medium: LinkMedium;
  readonly weight: number;
  readonly bitErrorRate: number;

  isBusy = {
    direct: false,
    reverse: false,
  };

  constructor(link: Omit<Link, 'type'> & { type: typeof LINK_TYPE.FULL_DUPLEX }) {
    this.id = link.id;

    this.sourceId = link.sourceId;
    this.targetId = link.targetId;

    this.type = link.type;
    this.medium = link.medium;
    this.weight = link.weight;
    this.bitErrorRate = link.bitErrorRate;
  }

  getProxy(source: StatefulNode): StatefulLink<boolean> {
    if (source.id !== this.sourceId && source.id !== this.targetId) {
      throw Error(`Node [${source.id}] does not belong to this link!`);
    }

    if (source.id === this.sourceId) {
      return new StatefulFullDuplexLinkProxy(this, { isReverse: false });
    } else {
      return new StatefulFullDuplexLinkProxy(this, { isReverse: true });
    }
  }
}

export class StatefulHalfDuplexLinkProxy implements StatefulLink<boolean> {
  private host: StatefulHalfDuplexLink;

  sourceId: number;
  targetId: number;

  get isBusy() {
    return this.host.isBusy;
  }

  set isBusy(value: boolean) {
    this.host.isBusy = value;
  }

  get id(): number {
    return this.host.id;
  }

  get type(): LinkType {
    return this.host.type;
  }

  get medium(): LinkMedium {
    return this.host.medium;
  }

  get weight(): number {
    return this.host.weight;
  }

  get bitErrorRate(): number {
    return this.host.bitErrorRate;
  }

  constructor(host: StatefulHalfDuplexLink, options: { isReverse: boolean }) {
    this.host = host;

    if (options.isReverse) {
      this.sourceId = host.targetId;
      this.targetId = host.sourceId;
    } else {
      this.sourceId = host.sourceId;
      this.targetId = host.targetId;
    }
  }

  getProxy(source: StatefulNode): StatefulLink<boolean> {
    return this.host.getProxy(source);
  }
}

export class StatefulFullDuplexLinkProxy implements StatefulLink<boolean> {
  private host: StatefulFullDuplexLink;

  sourceId: number;
  targetId: number;

  get isBusy() {
    if (this.sourceId === this.host.sourceId) {
      return this.host.isBusy.direct;
    } else {
      return this.host.isBusy.reverse;
    }
  }

  set isBusy(value: boolean) {
    if (this.sourceId === this.host.sourceId) {
      this.host.isBusy.direct = value;
    } else {
      this.host.isBusy.reverse = value;
    }
  }

  get id(): number {
    return this.host.id;
  }

  get type(): LinkType {
    return this.host.type;
  }

  get medium(): LinkMedium {
    return this.host.medium;
  }

  get weight(): number {
    return this.host.weight;
  }

  get bitErrorRate(): number {
    return this.host.bitErrorRate;
  }

  constructor(host: StatefulFullDuplexLink, options: { isReverse: boolean }) {
    this.host = host;

    if (options.isReverse) {
      this.sourceId = host.targetId;
      this.targetId = host.sourceId;
    } else {
      this.sourceId = host.sourceId;
      this.targetId = host.targetId;
    }
  }

  getProxy(source: StatefulNode): StatefulLink<boolean> {
    return this.host.getProxy(source);
  }
}

export function makeStatefulLink({ type, ...link }: Link) {
  switch (type) {
    case LINK_TYPE.FULL_DUPLEX:
      return new StatefulFullDuplexLink({
        ...link,
        type,
      });

    case LINK_TYPE.HALF_DUPLEX:
      return new StatefulHalfDuplexLink({
        ...link,
        type,
      });
  }
}
