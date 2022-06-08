import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message';
import { Pagination } from '../models/pagination';
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

  constructor(private messageService : MessageService) { }

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
    this.messageService.deleteMessage(id)
    .subscribe(() => {
      this.messages.splice(this.messages.findIndex((m) => m.id === id),1);
    })
  }

}
