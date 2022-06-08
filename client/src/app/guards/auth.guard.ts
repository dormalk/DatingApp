import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private toastr: ToastrService) { }
  
  canActivate():Observable<boolean>{
    return this.authService.currentUser$.pipe(
      map(user => {
        if(user) return true;
        this.toastr.error('You must be logged in to access this page');
        return false;
      })
    )
  }
  
}
