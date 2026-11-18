# TenantHub — Backend

Multi-tenant SaaS foundation: NestJS + Prisma 7 + PostgreSQL.

## Tenancy strategy (A1)

**Chosen: shared database, shared schema, with a `tenantId` column.**

Every tenant-owned table (`User`, `Project`) carries a `tenantId` foreign key
to `Tenant`. All companies share the same tables; a row belongs to a tenant
because of its `tenantId`. `SUPER_ADMIN` users have `tenantId = null` because
they sit above all tenants. Email is unique per tenant, so two companies may
each have `john@example.com`.

### Options considered

| | Shared schema + `tenantId` | Schema per tenant | Database per tenant |
|---|---|---|---|
| Isolation | Enforced by code only | Separate namespaces | Physically separate |
| Cost | Lowest (one DB) | Medium | Highest (N DBs to run/back up) |
| Migrations | Run once | Run N times | Run N times |
| Onboarding a tenant | Insert one row | Create schema + migrate | Provision a database |
| Cross-tenant queries | Easy | Harder | Hardest |
| Main risk | Forgotten tenant filter leaks data | Schema/connection sprawl | Operational overhead |

### Why this choice

- The Super Admin needs platform-wide views (all tenants, all users); a single
  schema makes that a normal query.
- Creating a tenant is a single insert, and one migration serves everyone.
- Lowest infrastructure cost, which suits many small tenants.

### Trade-off and mitigation

The weakness is that isolation depends on code: one missing `WHERE tenantId = ?`
leaks data across tenants. We mitigate it by:

1. Resolving the tenant once per request (A2) and exposing it to the whole request.
2. Scoping every tenant-owned query automatically with a Prisma extension (A3),
   so developers cannot forget the filter.
3. Rejecting tokens whose `tenantId` does not match the resolved tenant (B2).
4. Cross-tenant isolation tests (Part E).
