using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SACarCompare.Models
{
    public class Dealer
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public string ContactDetails { get; set; }

        public ICollection<Car> Cars { get; set; } = new List<Car>();
    }
}