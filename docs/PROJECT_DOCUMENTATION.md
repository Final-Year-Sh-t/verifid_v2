# VerifyID - Project Documentation

## Overview

VerifyID is a multi-tenant identity verification platform that allows institutions to manage and verify student/member records. Built with React, TypeScript, and Lovable Cloud (Supabase).

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite + SWC | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui (Radix UI) | Component Library |
| Lucide React | Icons |
| React Router DOM v6 | Routing |
| TanStack React Query | Server State Management |
| React Hook Form + Zod | Form Handling & Validation |
| Recharts | Data Visualization |
| date-fns | Date Utilities |
| next-themes | Dark/Light Mode |
| Sonner | Toast Notifications |
| PapaParse | CSV Parsing |
| XLSX | Excel File Processing |

### Backend (Lovable Cloud)
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Edge Functions (Deno) | Serverless Functions |
| Row-Level Security | Data Protection |

---

## Database Schema

### Tables

#### 1. `institutions`
Stores organization/institution data for multi-tenancy.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Institution name |
| `slug` | text | URL-friendly identifier |
| `logo_url` | text | Logo image URL |
| `primary_color` | text | Brand primary color |
| `secondary_color` | text | Brand secondary color |
| `welcome_text` | text | Custom welcome message |
| `require_photo` | boolean | Require photo for records |
| `enforce_expiry` | boolean | Enforce expiry dates |
| `allow_public_verification` | boolean | Allow public lookups |
| `custom_fields` | jsonb | Custom metadata fields |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### 2. `profiles`
User profile information linked to auth.users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users |
| `full_name` | text | User's display name |
| `avatar_url` | text | Profile picture URL |
| `institution_id` | uuid | Primary institution |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### 3. `user_roles`
Role-based access control with multi-institution support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users |
| `role` | app_role | admin, user, super_admin |
| `staff_type` | staff_role | verifier, registrar, security, viewer |
| `institution_id` | uuid | Institution scope |
| `is_active` | boolean | Currently active institution |
| `created_at` | timestamp | Creation timestamp |

#### 4. `index_records`
Identity records for verification.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `index_number` | text | Unique identifier (e.g., ID-2024-001) |
| `full_name` | text | Person's full name |
| `organization` | text | Associated organization |
| `photo_url` | text | ID photo URL |
| `status` | verification_status | pending, verified, rejected, expired |
| `issued_at` | date | Issue date |
| `expires_at` | date | Expiry date |
| `metadata` | jsonb | Custom fields data |
| `institution_id` | uuid | Owning institution |
| `created_by` | uuid | Creator user ID |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### 5. `verification_logs`
Audit trail for all verification attempts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `index_number` | text | Searched identifier |
| `verification_result` | boolean | Found or not found |
| `verified_by` | uuid | User who performed check |
| `institution_id` | uuid | Institution context |
| `ip_address` | text | Client IP |
| `user_agent` | text | Browser info |
| `created_at` | timestamp | Timestamp |

### Enums

```sql
-- User roles
CREATE TYPE app_role AS ENUM ('admin', 'user', 'super_admin');

-- Staff types for granular permissions
CREATE TYPE staff_role AS ENUM ('verifier', 'registrar', 'security', 'viewer');

-- Record verification status
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
```

### Database Functions

| Function | Purpose |
|----------|---------|
| `is_super_admin(uuid)` | Check if user is super admin |
| `has_role(uuid, app_role)` | Check if user has specific role |
| `get_user_institution(uuid)` | Get user's active institution ID |
| `get_user_institutions(uuid)` | Get all user's institution memberships |
| `create_institution_for_current_user(name)` | Create new institution with admin role |
| `join_institution_for_current_user(institution_id)` | Join existing institution |
| `switch_active_institution(institution_id)` | Switch active institution context |

---

## Application Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Index | Public | Landing page |
| `/auth` | Auth | Public | Login/Signup |
| `/register` | InstitutionRegister | Authenticated | Create/Join institution |
| `/verify` | Verify | Authenticated | Search & verify IDs |
| `/dashboard` | Dashboard | Authenticated | User dashboard |
| `/admin` | Admin | Admin | Manage records & users |
| `/settings` | InstitutionSettings | Admin | Institution configuration |
| `/super-admin` | SuperAdmin | Super Admin | Platform management |
| `/docs` | Docs | Public | Documentation |

---

## Key Features

### 1. Multi-Tenancy
- Institutions are isolated with their own data
- Users can belong to multiple institutions
- Active institution switching via dashboard
- Institution-scoped admin privileges

### 2. Role-Based Access Control
- **super_admin**: Platform-wide access
- **admin**: Institution-level management
- **user**: Basic verification access
- Staff types for granular permissions (verifier, registrar, security, viewer)

### 3. Identity Verification
- Search by index number
- Display verification results with photo
- Status tracking (pending, verified, rejected, expired)
- Audit logging of all verification attempts

### 4. Bulk Data Import
- CSV file upload support
- Excel (.xlsx) file support
- Column mapping interface
- Validation before import
- Edge function processing (`upload-students`)

### 5. Institution Management
- Custom branding (colors, logo, welcome text)
- Configurable settings (require photo, enforce expiry)
- Public verification toggle
- Custom metadata fields

### 6. User Dashboard
- Current institution overview
- Quick stats (total records, verified, pending)
- Recent verifications
- Institution switcher
- Other memberships display

---

## Security Implementation

### Row-Level Security (RLS)

All tables have RLS enabled with policies based on:
- User authentication (`auth.uid()`)
- Role checks via `has_role()` function
- Institution scope via `get_user_institution()` function

### Key Security Patterns

1. **Super Admin Override**: Super admins bypass institution restrictions
2. **Institution Scoping**: Admins only see their institution's data
3. **User Self-Access**: Users can view/edit their own records
4. **Audit Logging**: All verifications are logged with IP and user agent

---

## Edge Functions

### `upload-students`
Processes bulk student/record uploads.

**Endpoint**: `POST /functions/v1/upload-students`

**Headers**:
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Body**:
```json
{
  "records": [
    {
      "index_number": "ID-2024-001",
      "full_name": "John Doe",
      "organization": "Department A",
      "issued_at": "2024-01-01",
      "expires_at": "2025-01-01"
    }
  ],
  "institution_id": "uuid"
}
```

---

## Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── Navbar.tsx         # Navigation bar
│   ├── ui/                    # shadcn/ui components
│   ├── BulkUpload.tsx         # CSV/Excel upload component
│   └── NavLink.tsx            # Navigation link component
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notifications hook
├── lib/
│   ├── auth.tsx               # Auth context & provider
│   └── utils.ts               # Utility functions
├── pages/
│   ├── Index.tsx              # Landing page
│   ├── Auth.tsx               # Authentication page
│   ├── Dashboard.tsx          # User dashboard
│   ├── Verify.tsx             # Verification page
│   ├── Admin.tsx              # Admin panel
│   ├── SuperAdmin.tsx         # Super admin panel
│   ├── InstitutionRegister.tsx # Institution onboarding
│   ├── InstitutionSettings.tsx # Institution settings
│   ├── Docs.tsx               # Documentation
│   └── NotFound.tsx           # 404 page
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase client (auto-generated)
        └── types.ts           # TypeScript types (auto-generated)
```

---

## Authentication Flow

1. **Sign Up**: User registers with email/password
2. **Email Verification**: Confirmation email sent
3. **Sign In**: User authenticates
4. **Institution Check**: System checks for institution membership
5. **Onboarding**: If no institution, redirect to `/register`
6. **Dashboard**: Access granted with active institution context

---

## State Management

### Auth Context (`src/lib/auth.tsx`)
Provides global authentication state:
- `user`: Current Supabase user
- `session`: Active session
- `isAdmin`: Admin status for active institution
- `isSuperAdmin`: Super admin status
- `institutionId`: Active institution UUID
- `institution`: Full institution object
- `isLoading`: Loading state

### React Query
Used for server state:
- Caching API responses
- Automatic refetching
- Optimistic updates

---

## Theming

### CSS Variables (index.css)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  /* ... more tokens */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### Tailwind Config
Extends default theme with:
- Custom color tokens
- Font family configuration
- Animation utilities
- Border radius scales

---

## Development Notes

### Adding New Features

1. **New Table**: Use migration tool, add RLS policies
2. **New Page**: Create in `src/pages/`, add route in `App.tsx`
3. **New Component**: Create in `src/components/`, follow shadcn patterns
4. **New Edge Function**: Create in `supabase/functions/`

### Best Practices

- Use semantic Tailwind tokens, not raw colors
- Implement proper TypeScript types
- Add RLS policies for all new tables
- Use React Query for server state
- Follow existing component patterns

---

## Future Enhancements

- [ ] API key generation for external integrations
- [ ] Webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Batch status updates
- [ ] Export functionality
- [ ] Email notifications
- [ ] Mobile app integration
- [ ] SSO integration

---

*Last Updated: February 2026*
