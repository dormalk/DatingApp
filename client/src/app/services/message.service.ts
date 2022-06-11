import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BehaviorSubject, take } from "rxjs";
import { environment } from "src/environments/environment";
import { Group } from "../models/group";
import { Message } from "../models/message";
import { User } from "../models/user";
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
    providedIn: 'root'
})
export class MessageService{
    baseUrl = environment.apiUrl;
    hubUrl = environment.hubUrl;
    private hubConnection:HubConnection;
    private messageThreadSource = new BehaviorSubject<Message[]>([]);
    messageThread$ = this.messageThreadSource.asObservable();

    constructor(private http: HttpClient){}

    createHubConnection(user: User, otherUsername: string){
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl + "/message?user="+otherUsername,{
                accessTokenFactory: () => user.token
            })
            .withAutomaticReconnect()
            .build();
        this.hubConnection.start().catch((err) => console.error(err))


        this.hubConnection.on('RecivedMessageThread', (messages) => {
            this.messageThreadSource.next(messages);
        })

        this.hubConnection.on('NewMessage',(message) => {
            this.messageThread$.pipe(take(1)).subscribe((messages) => {
                this.messageThreadSource.next([...messages, message])
            })
        })

        this.hubConnection.on('UpdateGroup', (group:Group) => {
            if(group.connection.some(x => x.username === otherUsername)){
                this.messageThread$.pipe(take(1)).subscribe(messages => {
                    messages.forEach((message) => {
                        if(!message.dateRead){
                            message.dateRead = new Date(Date.now())
                        }
                    })
                    this.messageThreadSource.next([...messages])
                })
            }
        })
    }

    stopHubConnection(){
        if(this.hubConnection){
            this.hubConnection.stop();
        }
    }

    getMessages(pageNumber, pageSize,container){
        let params = getPaginationHeaders(pageNumber,pageSize);
        params = params.append("Container",container);
        return getPaginatedResult<Partial<Message[]>>(this.baseUrl + '/messages',params, this.http);
    
    }


    async sendMessage(recipientUsername:string,content:string){
        return this.hubConnection.invoke('SendMessage', {recipientUsername, content})
            .catch((error) => console.error(error))
    }

    deleteMessage(messageId: number){
        return this.http.delete(this.baseUrl + '/messages/' + messageId)
    }
}