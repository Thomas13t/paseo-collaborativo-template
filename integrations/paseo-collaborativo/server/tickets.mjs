import { randomUUID } from 'node:crypto';
export function createTicketStore({ now = Date.now, ttl = 300_000 } = {}) {
  const tickets = new Map();
  return {
    issue(plan) {
      for (const [id, ticket] of tickets) if (ticket.expires <= now()) tickets.delete(id);
      if (tickets.size >= 100) throw new Error('Troppe anteprime aperte: attendi la loro scadenza.');
      const id = randomUUID(); tickets.set(id, { plan, expires: now() + ttl }); return id;
    },
    consume(id) {
      const ticket = tickets.get(id); tickets.delete(id);
      if (!ticket || ticket.expires <= now()) throw new Error('Anteprima scaduta o già utilizzata. Prepara nuovamente l’invito.');
      return ticket.plan;
    },
    clear() { tickets.clear(); },
  };
}
