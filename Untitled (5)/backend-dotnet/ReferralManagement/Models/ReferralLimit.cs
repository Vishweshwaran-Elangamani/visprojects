using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReferralManagement.Models
{
    public class ReferralLimit
    {
        [Key, ForeignKey("User")]
        public int EmployeeId { get; set; }
        public User Employee { get; set; }
        [Required]
        public int LimitCount { get; set; }
        public int UsedCount { get; set; } = 0;
    }
}
