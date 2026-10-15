using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACarCompare.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SACarCompare.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // This action returns the main View that holds our entire single-page app
        public IActionResult Index()
        {
            return View();
        }

        // API endpoint to get all cars
        [HttpGet]
        public async Task<IActionResult> GetCarsData()
        {
            var cars = await _context.Cars.ToListAsync();
            return Json(cars);
        }

        // API endpoint to get all dealers
        [HttpGet]
        public async Task<IActionResult> GetDealersData()
        {
            var dealers = await _context.Dealers.ToListAsync();
            return Json(dealers);
        }

        // ADD THESE TWO NEW ACTIONS TO YOUR HomeController.cs

        public IActionResult DemoCars()
        {
            ViewData["Title"] = "Demo Cars";
            return View();
        }

        public IActionResult NewCars()
        {
            ViewData["Title"] = "New Cars";
            return View();
        }
    }

}