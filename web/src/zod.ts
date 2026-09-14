import { z } from 'zod';

// Stops zod probing for eval support with `new Function`, which the CSP
// reports as a violation.
z.config({ jitless: true });

export { z };
