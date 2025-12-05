# Routing and Role-Based Protection

This app centralizes protected and admin routes, and uses a single route guard to enforce authentication and role-based access.

## Key Files

- Protected route guard:
  - `src/components/Auth/ProtectedRoute.jsx`
  - Supports `requiredRole="ADMIN"` or `requiredRoles={["ADMIN","MASTER_ADMIN"]}`.
  - Redirects unauthenticated users to `/login` and unauthorized users to `/not-authorized`.

- Role constants:
  - `src/utils/roles.js`
  - `ROLES = { PATIENT, DOCTOR, ADMIN, MASTER_ADMIN }`

- Centralized route configs:
  - `src/routes/protectedRoutes.js`: All authenticated routes (non-admin).
  - `src/routes/adminRoutes.js`: Admin routes + required role list (`adminRequiredRoles`).

- Top-level router:
  - `src/App.jsx`: Generates all routes from the configs and wraps admin routes with `ProtectedRoute`.

- Not authorized page:
  - `src/pages/Errors/NotAuthorized.jsx`

## How protected routing works

1. All authenticated routes are defined in `protectedRoutes` and rendered under a parent `ProtectedRoute`, so users must be logged in.
2. Admin routes are defined in `adminRoutes` and wrapped with `ProtectedRoute requiredRoles={adminRequiredRoles}` so only ADMIN or MASTER_ADMIN can access.
3. The guard normalizes the user role coming from auth:
   - Accepts `user.role` as a string or as an object `{ name: "ADMIN" }`.

## Adding a new protected (non-admin) route

1. Create your page component under `src/pages/...`.
2. Add a route entry in `src/routes/protectedRoutes.js`:

```js
// src/routes/protectedRoutes.js
import MyNewPage from '../pages/MySection/MyNewPage';

export const protectedRoutes = [
  // ...existing routes
  { path: 'my-new-page', element: <MyNewPage /> },
];
```

3. The route will be picked up automatically by `App.jsx` inside the authenticated area.

## Adding a new admin route

1. Create your admin page component under `src/pages/Admin/...`.
2. Add to `src/routes/adminRoutes.js`:

```js
// src/routes/adminRoutes.js
import MyAdminTool from '../pages/Admin/MyAdminTool';
import { ROLES } from '../utils/roles';

export const adminRequiredRoles = [ROLES.ADMIN, ROLES.MASTER_ADMIN];

export const adminRoutes = [
  // ...existing
  { path: 'admin/my-tool', element: <MyAdminTool /> },
];
```

3. It will be routed via `App.jsx` and protected with ADMIN/MASTER_ADMIN roles.

## Changing required roles for admin routes

- Update `adminRequiredRoles` in `src/routes/adminRoutes.js` if you need to narrow or widen access. Example:

```js
import { ROLES } from '../utils/roles';
export const adminRequiredRoles = [ROLES.MASTER_ADMIN];
```

## Testing the guard

- Unit tests are in `src/components/Auth/ProtectedRoute.test.jsx`.
- They verify:
  - Redirect to `/login` when not authenticated.
  - Redirect to `/not-authorized` when authenticated but role not allowed.
  - Allow access when role is permitted (string or object forms).

## Common pitfalls

- Make sure the auth user shape is consistent. The guard handles both `user.role` (string) and `user.role.name` (object), but keeping it consistent is simpler.
- When adding routes, ensure there are no overlaps that could shadow dynamic segments (e.g. `doctors/:id` vs `doctors/new`).
