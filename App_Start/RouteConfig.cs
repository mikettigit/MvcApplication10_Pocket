using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MvcApplication10
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            string SettingsPocketPath = ConfigurationManager.AppSettings["PocketPath"];
            if (!String.IsNullOrEmpty(SettingsPocketPath))
            {
                string ServerFolderPath = HttpContext.Current.Server.MapPath("/");
                string[] directories = Directory.GetDirectories(ServerFolderPath + SettingsPocketPath);
                foreach (string directory in directories) {
                    string DomainNаme = Path.GetFileName(directory);
                    routes.MapRoute(
                       name: DomainNаme,
                       url: DomainNаme + "/{*query}",
                       defaults: new { controller = "Pocket", action = "PocketSelect", domain = DomainNаme, query = UrlParameter.Optional }
                   );                       
                }
            }

            routes.MapRoute(
                name: "Predefined",
                url: "Admin/{action}",
                defaults: new { controller = "Admin", action = "Index" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{*query}",
                defaults: new { controller = "Pocket", action = "Index" }
            );
        }
    }
}