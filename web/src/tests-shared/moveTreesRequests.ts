export const isMoveTreesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');
