import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/models/member';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';
import { Photo } from 'src/app/models/photo';
import { MembersService } from 'src/app/services/members.service';
@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member;
  user: User;
  baseUrl = environment.apiUrl;
  fileName: string;
  progress: number;

  constructor(private authService: AuthService, private membersService: MembersService) {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
   }

  ngOnInit(): void {
  }


  onFileSelected(event) {
    const file:File = event.target.files[0];
    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("file", file);
        const upload$ = this.membersService.addPhoto(formData);
        upload$.subscribe((photo : Photo) => {
          this.member.photos.push(photo)
          if(photo.isMain) {
            this.user.photoUrl = photo.url;
            this.member.photoUrl = photo.url;
            this.authService.setCurrentUser(this.user);
          }
        });
    }
  }

  setAsMainPhoto(photo: Photo) {
    this.membersService.setMainPhoto(photo.id)
    .subscribe(() => {
      this.user.photoUrl = photo.url;
      this.authService.setCurrentUser(this.user);
      this.member.photoUrl = photo.url;
      this.member.photos.forEach((p) => {
        if (p.isMain) p.isMain = false;
        if(p.id === photo.id) p.isMain = true;
      })
    })
  }

  handleDeletePhoto(photo: Photo){
    this.membersService.deletePhoto(photo.id)
    .subscribe(() => {
      this.member.photos.splice(this.member.photos.indexOf(photo), 1);
      if(photo.isMain) this.member.photoUrl = null;
      
    })
  }
}
