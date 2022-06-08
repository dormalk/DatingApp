import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  constructor(
    public authService: AuthService, 
    private router:Router) { }

  login(loginForm: NgForm){
    this.authService.login(loginForm.value.username, loginForm.value.password)
    .subscribe({
      next: () => this.router.navigate(['/members']),
      complete: () => loginForm.reset()
    })
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/'])
  }

}
