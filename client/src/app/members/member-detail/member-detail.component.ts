import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Subscription } from 'rxjs';
import { Member } from 'src/app/models/member';
import { Message } from 'src/app/models/message';
import { MembersService } from 'src/app/services/members.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs',{static: true}) memberTabs: TabsetComponent;
  member: Member;
  messages:Message[] = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  activeTab: TabDirective;

  constructor(private memberService: MembersService, 
      private route: ActivatedRoute,
      private messageService: MessageService) { }
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.member = data.member;
    })


    this.route.queryParams.subscribe(params => {
      params.tab ? this.selectTab(params.tab) : this.selectTab(0)
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]
    this.galleryImages = this.getImages();

  }


  getImages() : NgxGalleryImage[]{
    let imageUrls = []
    for(const photo of this.member.photos){
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url,
      })
    }
    return imageUrls;
  }



  onTabActivated(data: TabDirective){
    this.activeTab = data;
    console.log(data)
    if(this.activeTab.heading == 'Messages' && this.messages.length == 0){
      this.loadMessages();
    }
  }

  loadMessages(){
    this.messageService.getMessageThread(this.member.userName)
    .subscribe((messages:any) => {
      this.messages = messages;
    })
  }

  selectTab(tabId:number){
    this.memberTabs.tabs[tabId].active = true;
    window.scrollTo(0,0);
  }

}
