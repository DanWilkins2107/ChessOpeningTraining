import { randomTimestamp } from './randomTimestamp';

// Columns the database fills in on create, which a client must not supply.
export const SERVER_FILLED_COLUMNS = [
  ['id', crypto.randomUUID()],
  ['created_at', randomTimestamp()],
  ['owner_id', crypto.randomUUID()],
  ['position', 5],
];
