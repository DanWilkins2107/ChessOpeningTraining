// Columns the database fills in on create, which a client must not supply.
export const SERVER_FILLED_COLUMNS = [
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
  ['owner_id', crypto.randomUUID()],
];
