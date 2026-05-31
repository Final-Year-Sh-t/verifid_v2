# Sequence Diagram for VerifyID

Create a Mermaid sequence diagram saved to `/mnt/documents/VerifyID_Sequence.mmd` and emit it as a downloadable artifact.

## Note on stack

Your description mentions Firebase + Gemini API, but this project actually uses **Lovable Cloud (Supabase)** for auth/database/storage/edge functions, and **Lovable AI Gateway** (which serves Google Gemini and OpenAI models) for AI. I'll label the lifelines accordingly so the diagram matches the real system. If you'd prefer the labels to literally say "Firebase" and "Gemini API" for an assignment, tell me and I'll relabel.

## Participants (lifelines)

- `User` (End user / verifier)
- `SPA` (React Frontend — Vite + Auth Context)
- `Auth` (Lovable Cloud Auth)
- `DB` (PostgreSQL via PostgREST + RLS)
- `EdgeFn` (Edge Function: `upload-students`)
- `Storage` (institution-logos bucket)
- `AI` (Lovable AI Gateway — Gemini / GPT)

## Journey covered (chronological)

1. **Sign in**
   - User submits credentials → SPA → Auth → returns session/JWT
   - SPA → DB: fetch `user_roles` + active institution
   - SPA → DB: fetch `institutions` row for branding
   - SPA renders themed dashboard

2. **Verify an identity** (core flow)
   - User enters identification number on `/verify`
   - SPA → DB: `select from index_records where index_number = ? and status='active'` (RLS calls `has_role` / `get_user_institution`)
   - DB → SPA: record or null
   - SPA → DB: `insert into verification_logs` (institution_id, verified_by, result)
   - SPA renders result card (found / not found / expired)

3. **Admin bulk upload** (optional branch)
   - Admin selects CSV/Excel → SPA → EdgeFn `upload-students` (with JWT)
   - EdgeFn validates rows → EdgeFn → DB (service role insert into `index_records`)
   - EdgeFn → SPA: summary (inserted / skipped / errors)

4. **AI assist** (optional branch, e.g. doc Q&A or summary)
   - SPA → EdgeFn `chat` → AI Gateway (`google/gemini-3-flash-preview`, stream)
   - AI → EdgeFn → SPA (SSE token stream)

5. **Sign out**
   - User → SPA → Auth: signOut → session cleared

## Technical details

- Mermaid `sequenceDiagram` syntax with `autonumber`.
- Use `Note over` blocks to call out RLS enforcement on `index_records` and `verification_logs`.
- Use `alt` / `opt` blocks for: found vs not found, bulk upload branch, AI branch.
- Keep arrows: `->>` for sync calls, `-->>` for responses, `--)` for async/stream.
- No emojis (Mermaid lexer).

## Deliverable

Single `.mmd` file plus artifact tag:

```
<presentation-artifact path="VerifyID_Sequence.mmd" mime_type="text/vnd.mermaid"></presentation-artifact>
```
