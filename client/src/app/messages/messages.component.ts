import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message';
import { Pagination } from '../models/pagination';
import { ConfirmService } from '../services/confirm.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  pageNumber = 1
  pageSize = 5;
  pagination : Pagination;
  container = "Unread"
  messages:Message[];
  loading = false;

  constructor(private messageService : MessageService, private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(){
    this.loading = true;
    this.messageService.getMessages(this.pageNumber,this.pageSize, this.container)
    .subscribe((response) => {
      this.messages = response.result;
      this.pagination = response.pagination;
      this.loading = false;
    })
  }

  pageChanges(event:any){
    if(this.pageNumber != event.page){
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }

  deleteMessage(id: number){
    this.confirmService.confirm('Confirm Delete Message','This cannot be undone').subscribe(result => {
      if(result){
        this.messageService.deleteMessage(id)
        .subscribe(() => {
          this.messages.splice(this.messages.findIndex((m) => m.id === id),1);
        })
    
      }
    })
  }

}
