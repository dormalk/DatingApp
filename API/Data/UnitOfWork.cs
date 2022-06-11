using API.interfaces;
using AutoMapper;

namespace API.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DataContext context;
        private readonly IMapper mapper;
        public UnitOfWork(DataContext context, IMapper mapper)
        {
            this.mapper = mapper;
            this.context = context;
        }

        public IUserRepository userRepository => new UserRepository(context,mapper);

        public IMessageRepository messageRepository => new MessageRepository(context,mapper);

        public ILikesRepository likesRepository => new LikesRepository(context,mapper);

        public async Task<bool> Complete()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public bool HasChange()
        {
            return context.ChangeTracker.HasChanges();
        }
    }
}