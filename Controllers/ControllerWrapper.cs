using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class ControllerWrapper : Controller
    {
        //
        // GET: /Admin/
        protected PocketModel Pocket
        {
            get
            {
                PocketModel result = null;

                SessionManager sm = new SessionManager();

                object pocketModel = sm.Get("pocketModel");
                if (pocketModel != null)
                {
                    result = pocketModel as PocketModel;
                }
                else
                {
                    string SourceUrl = ConfigurationManager.AppSettings["PocketSource"];
                    if (!String.IsNullOrEmpty(SourceUrl) && Uri.IsWellFormedUriString(SourceUrl, UriKind.Absolute))
                    {
                        string ServerDomainName = Request.Url.Authority;
                        result = new PocketModel(SourceUrl, SourceUrl, ServerDomainName, false);
                        sm.Set("pocketModel", result);
                    }
                }

                return result;
            }
            set
            {
                SessionManager sm = new SessionManager();
                sm.Set("pocketModel", value);
            }
        }

        public void ResetPocket()
        {
            Pocket = null;
        }

        private IEnumerable<string> ExceptQueryParams
        {
            get
            {
                IEnumerable<string> result = null;

                SessionManager sm = new SessionManager();

                object exceptQueryParams = sm.Get("exceptQueryParams");
                if (exceptQueryParams != null)
                {
                    result = exceptQueryParams as IEnumerable<string>;
                }
                else
                {
                    string ExceptQueryParamsString = ConfigurationManager.AppSettings["ExceptQueryParams"];
                    result = ExceptQueryParamsString.Split(new char[1] { '|' }, StringSplitOptions.RemoveEmptyEntries);
                    sm.Set("exceptQueryParams", exceptQueryParams);
                }

                return result;
            }
        }

        public string GetClearRequestPath(string AbsolutePath, string QueryString)
        {
            var NameValueCollection = HttpUtility.ParseQueryString(QueryString);
            foreach (string _key in NameValueCollection.AllKeys)
            {
                if (_key != null)
                {
                    foreach (string ExceptQueryParam in ExceptQueryParams)
                    {
                        if (_key.Contains(ExceptQueryParam))
                        {
                            NameValueCollection.Remove(_key);
                        }
                    }
                }
            }
            string RequestQueryString = (NameValueCollection.Count > 0) ? "?" + NameValueCollection.ToString() : "";
            return String.Format("{0}{1}", AbsolutePath, RequestQueryString);
        }
    }
}
