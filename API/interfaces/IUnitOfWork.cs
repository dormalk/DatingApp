namespace API.interfaces{
    public interface IUnitOfWork{
        IUserRepository userRepository {get;}
        IMessageRepository messageRepository {get;}
        ILikesRepository likesRepository{get;}

        Task<bool> Complete();
        bool HasChange();
    }
}