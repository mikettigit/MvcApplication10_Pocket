using System;
using System.Collections.Generic;
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

            routes.MapRoute(
                name: "Scripts",
                url: "Home/Scripts/{*query}",
                defaults: new { controller = "Home", action = "Scripts", query = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Styles",
                url: "Home/Styles/{*query}",
                defaults: new { controller = "Home", action = "Styles", query = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Default",
                url: "{*query}",
                defaults: new { controller = "Pocket", action = "Index" }
            );
        }
    }
}