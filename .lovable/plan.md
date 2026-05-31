## ER Diagram for VerifyID

Create a Mermaid ER diagram saved to `/mnt/documents/VerifyID_ERD.mmd` and emit it as a downloadable artifact.

## Entities (from current schema)

- **auth.users** (managed by Lovable Cloud Auth) — `id`, `email`
- **institutions** — `id` (PK), `name`, `slug`, `logo_url`, `primary_color`, `secondary_color`, `welcome_text`, `require_photo`, `enforce_expiry`, `allow_public_verification`, `custom_fields`, timestamps
- **profiles** — `id` (PK), `user_id` (FK → auth.users), `full_name`, `avatar_url`, `institution_id` (FK → institutions), timestamps
- **user_roles** — `id` (PK), `user_id` (FK → auth.users), `role` (enum: super_admin/admin/user), `staff_type` (enum: verifier/registrar/security/viewer), `institution_id` (FK → institutions), `is_active`
- **index_records** — `id` (PK), `index_number`, `full_name`, `organization`, `photo_url`, `status` (enum), `issued_at`, `expires_at`, `metadata`, `institution_id` (FK), `created_by` (FK → auth.users), timestamps
- **verification_logs** — `id` (PK), `index_number`, `verification_result`, `verified_by` (FK → auth.users), `institution_id` (FK → institutions), `ip_address`, `user_agent`, `created_at`

## Relationships

- `auth.users` 1 — 1 `profiles` (one profile per user)
- `auth.users` 1 — N `user_roles` (a user can hold roles across multiple institutions)
- `institutions` 1 — N `user_roles` (memberships)
- `institutions` 1 — N `profiles` (primary institution per user)
- `institutions` 1 — N `index_records`
- `institutions` 1 — N `verification_logs`
- `auth.users` 1 — N `index_records` (created_by)
- `auth.users` 1 — N `verification_logs` (verified_by)

## Mermaid technical details

- Use `erDiagram` syntax.
- Show PK/FK annotations and key columns only (skip timestamps in diagram for clarity).
- Include enum values in comments next to `role`, `staff_type`, `status`.
- Use crow's-foot cardinality: `||--o{` for 1-to-many, `||--||` for 1-to-1.
- No emojis (Mermaid lexer).

## Deliverable

Single `.mmd` file plus artifact tag:

```
<presentation-artifact path="VerifyID_ERD.mmd" mime_type="text/vnd.mermaid"></presentation-artifact>
```
