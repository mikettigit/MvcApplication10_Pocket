﻿using System;
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
                name: "Predefined",
                url: "{controller}/{action}",
                defaults: new { action = "Index" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{*query}",
                defaults: new { controller = "Pocket", action = "Index" }
            );
        }
    }
}