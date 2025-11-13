import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user/user.service';

export const configCompleteGuard: CanActivateFn = () => {
  const userService = inject(UserService);

  return userService.userInfoSignal$.pipe(
    map((user) => {
      // TODO verificar possibilidades de identificar um primeiro login

      return true;
    })
  );
};
