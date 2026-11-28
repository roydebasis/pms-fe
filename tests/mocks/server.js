import { setupServer } from 'msw/node'

// All HTTP in tests is intercepted here. Unhandled requests fail the test so
// no suite can accidentally reach a live backend URL.
export const server = setupServer()
