using API.Extensions;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMessageRepository messageRepository;
        private readonly IMapper _mapper;
        public MessageHub(IMessageRepository messageRepository, IMapper _mapper)
        {
            this._mapper = _mapper;
            this.messageRepository = messageRepository;
        }


        public override async Task OnConnectedAsync(){
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUsername(), otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            
        }

        private string GetGroupName(string caller, string other){
            var stringCompare = string.CompareOrdinal(caller,other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}" ;
        }
    }
}