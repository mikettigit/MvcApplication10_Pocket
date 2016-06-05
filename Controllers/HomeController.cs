using System.IO;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        private ActionResult Base(string path)
        {
            if (System.IO.File.Exists(path))
            {
                FileStream filestream = new FileStream(path, FileMode.Open);

                string ContentType = "*/*";
                if (Request.AcceptTypes.Length > 0)
                {
                    ContentType = Request.AcceptTypes[0];
                }
                return new FileStreamResult(filestream, ContentType);
            }
            else
            {
                var ctrl = new PocketController();
                ctrl.ControllerContext = ControllerContext;
                return ctrl.Index();
            }
        }

        public ActionResult Scripts(string query)
        {
            string ScriptsFolderPath = Server.MapPath("/Scripts/");
            string path = ScriptsFolderPath + query.Replace('/', '\\');
            return Base(path);
        }

        public ActionResult Styles(string query)
        {
            string ScriptsFolderPath = Server.MapPath("/Styles/");
            string path = ScriptsFolderPath + query.Replace('/', '\\');
            return Base(path);
        }

    }
}
