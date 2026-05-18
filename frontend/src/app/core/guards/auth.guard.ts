import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles: string[] = route.data['roles'] ?? [];
  if (requiredRoles.length > 0 && !auth.hasRole(...requiredRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
