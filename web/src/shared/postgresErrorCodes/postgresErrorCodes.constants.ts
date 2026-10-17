// The code Postgres gives an insert or update that breaks a CHECK constraint,
// which is how the database enforces every cap.
export const CHECK_VIOLATION = '23514';
