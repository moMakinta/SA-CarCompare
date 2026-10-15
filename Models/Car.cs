using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SACarCompare.Models
{
    public class Car
    {
        public int Id { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public int Year { get; set; }
        public int Price { get; set; }
        public int? Mileage { get; set; }
        public string FuelType { get; set; }
        public string Transmission { get; set; }
        public string Features { get; set; } // Storing as JSON or comma-separated
        public string Photos { get; set; }   // Storing as JSON or comma-separated URLs

        // Foreign Key relationship to Dealer
        public int DealerId { get; set; }
        public Dealer Dealer { get; set; }
    }
}