using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class AdminController : Controller
    {
        //
        // GET: /Admin/

        public ActionResult Index()
        {
            return View();
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Login(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();
            jm.Result = false;
            jm.Message = "Не найдена модель...";

            SessionManager sm = new SessionManager();
            object pocketModel = sm.Get("pocketModel");
            if (pocketModel != null)
            {
                jm.Message = "Пароль не соответствует логину...";
                jm.Result = true;
                (pocketModel as PocketModel).adminmode = true;
            }
            
            return Json(jm);
        }

    }
}
