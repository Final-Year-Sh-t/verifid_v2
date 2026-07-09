## Plan: Password Visibility Toggle on Login

### What to build
Add a show/hide password eye icon button inside all password input fields on the **Auth** page (mobile and desktop sign-in/sign-up forms).

### Implementation
1. **Modify `Auth.tsx`** — update the `FloatingInput` component to accept an optional `showToggle` prop.
2. When `showToggle` is true and the input `type` is `password`, render an eye icon button at the right edge of the input field.
3. Clicking the button toggles the input type between `password` and `text`.
4. Apply this to:
   - Mobile: password, confirm password
   - Desktop sign-in: password
   - Desktop sign-up: password, confirm password
5. Use `Eye` / `EyeOff` icons from `lucide-react` (already imported in `Auth.tsx`).

### Files changed
- `src/pages/Auth.tsx`