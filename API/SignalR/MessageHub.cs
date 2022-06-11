using API.DTOs;
using API.Entities;
using API.Extensions;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork unitOfWork;
        private readonly IHubContext<PresenceHub> presenceHub;
        private readonly PresenceTracker tracker;

        public MessageHub(IMapper _mapper, IUnitOfWork unitOfWork,
            IHubContext<PresenceHub> presenceHub,
            PresenceTracker tracker)
        {
            this.tracker = tracker;
            this.presenceHub = presenceHub;
            this._mapper = _mapper;
            this.unitOfWork = unitOfWork;
        }


        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUsername(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdateGroup",group);
            var messages = await unitOfWork.messageRepository.GetMessagesThread(Context.User.GetUsername(), otherUser);

            if(unitOfWork.HasChange()){
                await unitOfWork.Complete();
            }
            
            await Clients.Group(groupName).SendAsync("RecivedMessageThread", messages);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdateGroup",group);

            await base.OnDisconnectedAsync(exception);
        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await unitOfWork.messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, Context.User.GetUsername());

            if (group == null)
            {
                group = new Group(groupName);
                unitOfWork.messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            if(await unitOfWork.Complete()) return group;

            throw new HubException("Fail to join to group");
        }

        private async Task<Group> RemoveFromMessageGroup()
        {
            var group = await unitOfWork.messageRepository.GetGropForConnectionId(Context.ConnectionId);
            var connection = group.Connections.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);
            unitOfWork.messageRepository.RemoveConnection(connection);
            if(await unitOfWork.Complete()) return group;

            throw new HubException("Fail to remove from group");
        }

        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User.GetUsername();
            if (username == createMessageDto.RecipientUsername.ToLower())
            {
                throw new HubException("You cannot send message to yourself");
            }

            var sender = await unitOfWork.userRepository.GetUserByUsernameAsync(username);
            var recipient = await unitOfWork.userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

            if (recipient == null) throw new HubException("Not found user");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            unitOfWork.messageRepository.AddMessage(message);
            var groupName = GetGroupName(sender.UserName, recipient.UserName);

            var group = await unitOfWork.messageRepository.GetMessageGroup(groupName);

            if (group.Connections.Any(x => x.Username == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;
            }
            else
            {
                var connections = await tracker.GetConnectionsForUser(recipient.UserName);
                if(connections != null){
                    await presenceHub.Clients.Clients(connections).SendAsync("NewMessageRecived",
                        new {username = sender.UserName, knownAs = sender.KnownAs});
                } 
            }

            if (await unitOfWork.Complete())
            {
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
            }
        }

        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
    }
}