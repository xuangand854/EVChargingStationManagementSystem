using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Common.DTOs.EVDriverDto
{
    public class EVDriverCreateProfileDto
    {
        [Required(ErrorMessage = "AccountId là bắt buộc")]
        public Guid AccountId { get; set; }

        [Required(ErrorMessage = "RankingId là bắt buộc")]
        public Guid RankingId { get; set; }

        // Danh sách xe ban đầu mà EVDriver đăng ký
        public List<Guid>? VehicleModelIds { get; set; }

        // Trạng thái mặc định khi tạo profile
        public string Status { get; set; } = "Active";
    }
}
