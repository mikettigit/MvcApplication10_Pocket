using HtmlAgilityPack;
using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class PocketController : ControllerWrapper
    {
        //
        // GET: /Pocket/
       
        protected Dictionary<string, string> SharedControls
        {
            get 
            {
                Dictionary<string, string> result = new  Dictionary<string, string>();

                SessionManager sm = new SessionManager();

                object sharedControls = sm.Get("sharedControls");
                if (sharedControls != null)
                {
                    result = sharedControls as Dictionary<string, string>;
                }
                else
                {
                    string RelativeControlsPath = "/Views/Shared/Controls/";
                    string ControlsPath = Server.MapPath("/") + RelativeControlsPath;
                    string[] Files = Directory.GetFiles(ControlsPath);
                    foreach (var File in Files)
                    {
                        string ControlName = Path.GetFileName(File);
                        result.Add(ControlName, "~" + RelativeControlsPath + ControlName);
                    }
                    sm.Set("sharedControls", result);
                }

                return result;
            }
        }

        private string RenderRazorViewToString(string viewName, object model)
        {
            ViewData.Model = model;
            using (var sw = new StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
                var viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                viewResult.View.Render(viewContext, sw);
                viewResult.ViewEngine.ReleaseView(ControllerContext, viewResult.View);
                return sw.GetStringBuilder().ToString();
            } 
        }

        public string GetCrossdomainContent(FormCollection collection)
        {

            string result = "";

            CookieContainer cookiecontainer = new CookieContainer();

            var CrossdomainRequest = (HttpWebRequest)WebRequest.Create("http://www.site.com");
            CrossdomainRequest.CookieContainer = cookiecontainer;
            CrossdomainRequest.Method = "POST";
            CrossdomainRequest.ContentType = "application/x-www-form-urlencoded";


            string CrossdomainRequestParams = "";
            foreach (string key in collection.Keys)
            {
                CrossdomainRequestParams += (CrossdomainRequestParams.IsEmpty() ? "" : "&") + key + "=" + collection[key];
            }
            CrossdomainRequestParams += (CrossdomainRequestParams.IsEmpty() ? "" : "&") + "SomeParam=1";

            var buffer = Encoding.ASCII.GetBytes(CrossdomainRequestParams);
            CrossdomainRequest.ContentLength = buffer.Length;
            var requestStream = CrossdomainRequest.GetRequestStream();
            requestStream.Write(buffer, 0, buffer.Length);
            requestStream.Close();
            
            var response = (HttpWebResponse)CrossdomainRequest.GetResponse();
            using (var streamReader = new StreamReader(response.GetResponseStream()))
            {
                result = streamReader.ReadToEnd();
            }

            return result;

        }

        [AcceptVerbs(HttpVerbs.Get)]
        //[OutputCache(CacheProfile = "Index Get")]
        public ActionResult PocketSelect(string domain, string query)
        {
            string SourceUrl = Request.Url.Scheme + "://" + domain;
            string ServerDomainName = Request.Url.Authority;
            if (SourceUrl != Pocket.SourceUrl)
            {
                Pocket = new PocketModel(SourceUrl, ServerDomainName, true);
            }
            return Index();
        }
        
        [AcceptVerbs(HttpVerbs.Get)]
        //[OutputCache(CacheProfile = "Index Get")]
        public ActionResult Index()
        {
            string RequestPath = GetClearRequestPath(Request.Url.AbsolutePath, Request.QueryString.ToString());
            if (Pocket.Switched)
            {
                string SourceUrl = "/" + (new Uri(Pocket.SourceUrl).Host);
                if (RequestPath.StartsWith(SourceUrl))
                {
                    RequestPath = RequestPath.Replace(SourceUrl, "");
                }
            }

            string ContentType = MimeMapping.GetMimeMapping(Request.Path).ToLower();
            if ((ContentType == "application/octet-stream"
                    || ContentType == "text/html")
                &&
                ((Request.AcceptTypes.Length == 1 && Request.AcceptTypes[0] == "*/*")
                        || Request.AcceptTypes.Any(r => r.ToLower() == "text/html")
                        || Request.AcceptTypes.Any(r => r.ToLower() == "text/plain")
                        || Request.AcceptTypes.Any(r => r.ToLower() == "application/xhtml+xml")
                        || Request.AcceptTypes.Any(r => r.ToLower() == "application/xml")))
            {
                if (Pocket == null)
                {
                    return Content(String.Format("Invalid pocket"));
                }
                else
                {
                    string content = Pocket.GetContent(RequestPath, false);

                    if (Pocket.AdminModel.Active || Pocket.Switched)
                    {
                        HtmlDocument doc = new HtmlDocument();
                        doc.LoadHtml(content);
                        if (Pocket.AdminModel.Active)
                        {
                            var ScriptNodes = doc.DocumentNode.SelectNodes("//script");
                            if (ScriptNodes != null) {
                                foreach (var ScriptNode in ScriptNodes)
                                {
                                    var commentedScript = doc.CreateTextNode(Pocket.AdminModel.OpeningCommentBracket + ScriptNode.OuterHtml + Pocket.AdminModel.ClosingCommentBracket);
                                    ScriptNode.ParentNode.ReplaceChild(commentedScript, ScriptNode);
                                }
                            }
                        }
                        if (Pocket.Switched)
                        {
                            string MultiServerDomainName = "//" + Pocket.ServerDomainName + "/" + (new Uri(Pocket.SourceUrl)).Host;
                            var SrcNodes = doc.DocumentNode.SelectNodes("//*[starts-with(@src,'/')][substring(@src,2,1)!='/']");
                            if (SrcNodes != null)
                            {
                                foreach (var SrcNode in SrcNodes)
                                {
                                    SrcNode.Attributes["src"].Value = MultiServerDomainName + SrcNode.Attributes["src"].Value;
                                }
                            }
                            var HrefNodes = doc.DocumentNode.SelectNodes("//*[starts-with(@href,'/')][substring(@href,2,1)!='/']");
                            if (HrefNodes != null)
                            {
                                foreach (var HrefNode in HrefNodes)
                                {
                                    HrefNode.Attributes["href"].Value = MultiServerDomainName + HrefNode.Attributes["href"].Value;
                                }
                            }
                        }
                        content = doc.DocumentNode.OuterHtml;
                    }

                    foreach (var ControlName in SharedControls)
                    {
                        if (content.Contains("@" + ControlName.Key))
                        {
                            string template = RenderRazorViewToString(ControlName.Value, Pocket);
                            content = content.Replace("@" + ControlName.Key, template);
                        }
                    }

                    if (String.IsNullOrWhiteSpace(content))
                    {
                        return View("~/Views/Empty.cshtml", Pocket);
                    }
                    else
                    {
                        return Content(content);
                    }
                }
            }
            else if (ContentType == "application/javascript" || ContentType == "text/css")
            {
                string content = "";
                if (Pocket != null)
                {
                    content = Pocket.GetContent(RequestPath, true);
                }
                return new FileContentResult(Encoding.UTF8.GetBytes(content), ContentType);
            }
            else
            {
                Stream Stream = new MemoryStream();
                if (Pocket != null)
                {
                    Stream = Pocket.GetSourceFileStream(RequestPath);
                }
                return new FileStreamResult(Stream, ContentType);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Index(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();

            if (collection["SomeCrossdomainContentName"] != null)
            {
                jm.Object = "SomeCrossdomainContent";
                jm.Message = GetCrossdomainContent(collection);
                return Json(jm);
            }

            if (String.IsNullOrEmpty(collection["2fea14ff-d8e3-42c1-a230-3917b7a640c9"]))
            {
                jm.Result = true;
                jm.Message = "Невозможно отправить данные - не обнаружен ключ формы";
            }
            else if (String.IsNullOrEmpty(Pocket.MessageFrom))
            {
                jm.Result = true;
                jm.Message = "Невозможно отправить данные - не настроен сервер отправки";
            }
            else if (String.IsNullOrEmpty(Pocket.MessageFrom))
            {
                jm.Result = true;
                jm.Message = "Невозможно отправить данные - не задан получатель";
            }
            else
            {
                try
                {
                    string subject = "Notification " + Pocket.ServerDomainName;
                    string body = "";
                    Collection<Attachment> attachments = new Collection<Attachment>();

                    string[] AllKeys = ((System.Collections.Specialized.NameValueCollection)(collection)).AllKeys;
                    foreach (var key in AllKeys)
                    {
                        body += key + ": " + collection[key] + System.Environment.NewLine;
                    }

                    foreach (string OneFile in Request.Files)
                    {
                        HttpPostedFileBase hpf = Request.Files[OneFile] as HttpPostedFileBase;
                        if (hpf.ContentLength > 0)
                        {
                            Attachment attachment = new Attachment(hpf.InputStream, hpf.FileName);
                            attachments.Add(attachment);
                        }
                    }

                    MailMessage mailObj = new MailMessage();
                    mailObj.From = new MailAddress(Pocket.MessageFrom);
                    mailObj.To.Add(Pocket.MessageTo);
                    mailObj.Subject = subject;
                    mailObj.Body = body;
                    foreach (var attachment in attachments)
                    {
                        mailObj.Attachments.Add(attachment);
                    }

                    SmtpClient SMTPServer = new SmtpClient("localhost");
                    SMTPServer.Send(mailObj);

                    jm.Result = true;
                    jm.Message = "Данные отправлены, благодарим за сотрудничество...";
                }
                catch (Exception e)
                {
                    jm.Result = true;
                    jm.Message = "Во время отправки произошла ошибка - " + e.ToString();
                }
            }

            return Json(jm);
        }

    }
}
