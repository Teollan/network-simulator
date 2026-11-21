export const NODE_TYPE = {
  ROUTER: 'router',
  WORKSTATION: 'workstation',
} as const;

export const DEFAULT_NODE_FIELDS = {
  type: NODE_TYPE.ROUTER,
  bufferSize: { default: 64 },
};
