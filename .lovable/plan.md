# System Architecture Diagram for VerifyID

Create a Mermaid architecture diagram saved to `/mnt/documents/VerifyID_Architecture.mmd` and emit as a downloadable artifact.

## Layers

**Client (Browser)**
- React 18 + Vite + TypeScript SPA
- Tailwind + shadcn/ui
- React Router, TanStack Query, React Hook Form + Zod
- Auth Context (`src/lib/auth.tsx`)
- Pages: Index, Auth, Dashboard, Verify, Admin, SuperAdmin, InstitutionRegister, InstitutionSettings, Docs

**Lovable Cloud (Backend — powered by Supabase)**
- **Auth**: email/password + Google OAuth
- **PostgreSQL Database** with RLS
  - Tables: institutions, profiles, user_roles, index_records, verification_logs
  - Functions: has_role, is_super_admin, get_user_institution, switch_active_institution
- **Edge Functions (Deno)**: `upload-students`
- **File Storage**: `institution-logos` bucket
- **AI Gateway** (Lovable AI, via LOVABLE_API_KEY)

**External**
- Google OAuth provider
- End user's browser

## Flow Arrows

- Browser ⇄ React SPA
- SPA → Supabase Auth (sign in/up, Google OAuth)
- SPA → PostgREST (CRUD on tables, gated by RLS)
- SPA → Edge Function `upload-students` (bulk CSV/Excel)
- Edge Function → PostgreSQL (service role inserts)
- SPA → Storage (logo upload/fetch)
- Auth → user_roles / profiles (trigger creates profile on signup)
- PostgreSQL RLS → calls `has_role` / `get_user_institution`

## Deliverable

Single Mermaid `flowchart TB` with grouped subgraphs (Client, Lovable Cloud, External) and styled nodes. Output:

```
<presentation-artifact path="VerifyID_Architecture.mmd" mime_type="text/vnd.mermaid"></presentation-artifact>
```
