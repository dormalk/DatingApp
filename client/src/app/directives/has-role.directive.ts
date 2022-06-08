import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit{
  user:User;
  @Input() appHasRole: string[];
  constructor(private viewContainerRef: ViewContainerRef, 
      private templateRef:TemplateRef<any>,
      private authService: AuthService) {

      this.authService.currentUser$.pipe(take(1)).subscribe(user => {
        this.user = user;
      })
  }

  ngOnInit(): void {
    if(!this.user?.roles || this.user == null){
      this.viewContainerRef.clear();
      return;
    }
    const test = this.user?.roles.some(r => this.appHasRole.includes(r));
    if(this.user?.roles.some(r => this.appHasRole.includes(r))){
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

}
