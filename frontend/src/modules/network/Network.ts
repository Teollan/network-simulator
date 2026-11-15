import { DEFAULT_NODE_FIELDS, type CreateNodeFields, type Node } from '@/modules/network/Node';
import { DEFAULT_LINK_FIELDS, type CreateLinkFields, type Link, type LinkFilters, type UpdateLinkFields } from '@/modules/network/Link';
import { getLinkComplement, isLinkWith } from '@/modules/network/network.helpers';
import type { CreateRegionFields, Region } from '@/modules/network/Region';
import { Serial } from '@/modules/util/Serial';

export class Network {
  private regionsSerial = new Serial();
  private regions: Region[] = [];

  private nodesSerial = new Serial();
  private nodes: Node[] = [];

  private linksSerial = new Serial();
  private links: Link[] = [];

  // === REGION === 
  findRegion(regionId: number): Region | null {
    return this.regions.find(
      (region) => region.id === regionId,
    ) ?? null;
  }

  findRegionByLabel(regionLabel: string): Region | null {
    return this.regions.find(
      (region) => region.label === regionLabel,
    ) ?? null;
  }

  getRegion(regionId: number): Region {
    const result = this.findRegion(regionId);

    if (!result) {
      throw Error(`Region with id [${regionId}] does not exist!`);
    }

    return result;
  }

  getRegions(): Region[] {
    return [...this.regions];
  }

  getRegionByLabel(regionLabel: string): Region {
    const result = this.findRegionByLabel(regionLabel);

    if (!result) {
      throw Error(`Region with label [${regionLabel}] does not exist`);
    }

    return result;
  }

  createRegion(fields: CreateRegionFields): Region {
    const { regions, regionsSerial } = this;

    const created = {
      id: regionsSerial.next(),
      ...fields,
    };

    regions.push(created);

    return created;
  }

  // === NODE === 
  getNodes(): Node[] {
    return [...this.nodes];
  }

  getLinkedNodes(nodeId: number): Node[] {
    const { nodes, links } = this;

    const nodeLinks = links.filter(isLinkWith(nodeId));
    const linkedNodeIds = nodeLinks.map(getLinkComplement(nodeId));

    return nodes.filter(({ id }) => linkedNodeIds.includes(id));
  }

  getNodesByRegion(regionId: number): Node[] {
    return this.nodes.filter(
      (node) => node.regionId === regionId,
    );
  }

  getNodesByRegionLabel(regionLabel: string): Node[] {
    const region = this.getRegionByLabel(regionLabel);

    return this.nodes.filter(
      (node) => node.regionId === region.id,
    );
  }

  createManyNodes(records: CreateNodeFields[]): Node[] {
    const { nodes, nodesSerial } = this;

    const created = records.map((fields) => ({
      id: nodesSerial.next(),
      ...DEFAULT_NODE_FIELDS,
      ...fields,
    }));

    nodes.push(...created);

    return created;
  }

  // === LINK === 
  findLinkBetween(a: number, b: number): Link | null {
    const { links } = this;

    return links.find((link) => {
      const isDirect = link.sourceId === a && link.targetId === b;
      const isReverse = link.sourceId === b && link.targetId === a;

      return isDirect || isReverse;
    }) ?? null;
  }

  getLinks(filters: LinkFilters = {}): Link[] {
    const { links } = this;

    const keys = Object.keys(filters) as (keyof LinkFilters)[];

    return links.filter((link) => (
      keys.every((key) => (
        filters[key] === undefined || link[key] === filters[key]
      ))
    ));
  }

  getLinkBetween(a: number, b: number): Link {
    const result = this.findLinkBetween(a, b);

    if (!result) {
      throw Error(`Link between nodes [${a}] and [${b}] does not exist!`);
    }

    return result;
  }

  createLink(fields: CreateLinkFields) {
    const { links, linksSerial } = this;

    links.push({
      id: linksSerial.next(),
      ...DEFAULT_LINK_FIELDS,
      ...fields,
    });
  }

  createManyLinks(records: CreateLinkFields[]) {
    const { links, linksSerial } = this;

    const created = records.map((fields) => ({
      id: linksSerial.next(),
      ...DEFAULT_LINK_FIELDS,
      ...fields,
    }));

    links.push(...created);

    return created;
  }

  updateManyLinks(records: UpdateLinkFields[]) {
    const { links } = this;

    for (const fields of records) {
      const index = links.findIndex((link) => link.id === fields.id);

      links[index] = {
        ...links[index],
        ...fields,
      };
    }
  }
}
