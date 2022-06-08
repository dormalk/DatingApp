import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>();
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http : HttpClient, private presenceService: PresenceService) { }

  login(username:string, password: string) {
    return this.http.post(this.baseUrl + '/account/login', {username, password}).pipe(
      map((response:User) => {
        const user = response;
        if(user){
          this.setCurrentUser(user);
          this.presenceService.createHubConnection(user);
        }
      })
    );
  }

  register(model){
    return this.http.post(this.baseUrl + '/account/register', model).pipe(
      map((user:User) => {
        if(user) {
          this.setCurrentUser(user);
          this.presenceService.createHubConnection(user);
        }
      })
    );
  }

  setCurrentUser(user:User){
    user.roles = [];
    const roles = this.getDecodedToken(user.token)?.role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    this.currentUserSource.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(){
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presenceService.stopHubConnection();
  }


  getDecodedToken(token){
    return JSON.parse(atob(token.split('.')[1]));
  }
}
