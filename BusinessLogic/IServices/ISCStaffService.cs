using BusinessLogic.Base;

namespace BusinessLogic.IServices
{
    public interface ISCStaffService
    {
        Task <IServiceResult> GetById(Guid id);

    }
}
