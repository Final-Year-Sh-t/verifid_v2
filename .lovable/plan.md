# Use Case Diagram for VerifyID

Create a Mermaid use case diagram saved to `/mnt/documents/VerifyID_UseCase.mmd` and render it as a downloadable artifact in chat.

## Actors

- **Public / Guest** — unauthenticated visitor
- **Authenticated User** — signed-in verifier
- **Institution Admin** — manages a single institution
- **Super Admin** — platform-wide management
- **System (Edge Functions)** — automated processing (bulk upload, logging)

## Use Cases by Actor

**Public**
- View landing page
- View documentation
- Sign up / Sign in (email + Google)
- Perform public verification (if institution allows)

**Authenticated User**
- Verify identity by ID number
- View verification result (photo, name, status)
- Switch active institution
- View personal dashboard
- Join / create an institution

**Institution Admin** (inherits Authenticated User)
- Manage index records (create, edit, delete)
- Bulk upload records (CSV / Excel)
- Set record status (Active / Inactive / Expired)
- View verification logs
- Configure institution (branding, settings, custom fields)
- Toggle public verification

**Super Admin** (inherits Admin)
- Manage all institutions
- Manage all users and roles
- Access platform-wide analytics

**System**
- Process bulk uploads (`upload-students` edge function)
- Log every verification attempt (IP, user agent)
- Enforce RLS / role checks via `has_role`

## Relationships

- `<<include>>`: "Verify identity" includes "Log verification attempt"
- `<<include>>`: "Bulk upload records" includes "Validate & insert via edge function"
- `<<extend>>`: "Public verification" extends "Verify identity" (only when institution allows)
- Inheritance: Super Admin → Admin → Authenticated User → Public

## Deliverable

A single Mermaid file using `graph` syntax (Mermaid lacks a native use-case diagram, so actors are rendered as styled nodes and use cases as ellipse-shaped nodes grouped in a "System Boundary" subgraph). Output emitted as:

```
<lov-artifact url="/__l5e/documents/VerifyID_UseCase.mmd" mime_type="text/vnd.mermaid"></lov-artifact>
```
