using System.IO;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {
            return View();
        }

    }
}
