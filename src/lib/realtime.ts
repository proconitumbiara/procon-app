export const REALTIME_CHANNELS = {
  tickets: "tickets",
  operations: "operations",
  clients: "clients",
  professionals: "professionals",
  panel: "painel",
  system: "sistema",
} as const;

export const REALTIME_EVENTS = {
  ticketsChanged: "tickets-changed",
  ticketCreated: "ticket-created",
  ticketUpdated: "ticket-updated",
  operationStarted: "operation-started",
  operationPaused: "operation-paused",
  operationResumed: "operation-resumed",
  operationFinished: "operation-finished",
  clientsChanged: "clients-changed",
  professionalsChanged: "professionals-changed",
  autoCallCheck: "auto-call-check",
} as const;

