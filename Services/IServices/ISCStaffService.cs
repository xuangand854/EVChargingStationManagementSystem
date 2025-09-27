using Services.Base;

namespace Services.IServices
{
    public interface ISCStaffService
    {
        Task <IServiceResult> GetById(Guid id);

    }
}
