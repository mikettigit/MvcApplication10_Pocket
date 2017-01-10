using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class PocketController : Controller
    {
        //
        // GET: /Pocket/

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
                    if (!String.IsNullOrEmpty(SourceUrl))
                    {
                        string ServerFolderPath = Server.MapPath("/");
                        string AllPocketsFolderPath = ConfigurationManager.AppSettings["PocketPath"];
                        if (!String.IsNullOrEmpty(AllPocketsFolderPath))
                        {
                            AllPocketsFolderPath = ServerFolderPath + AllPocketsFolderPath;
                        }
                        string ServerDomainName = Request.Url.Authority;
                        string messagefrom = ConfigurationManager.AppSettings["DefaultMessageFrom"];
                        string messageto = ConfigurationManager.AppSettings["DefaultMessageTo"];
                        result = new PocketModel(Guid.Empty, SourceUrl, AllPocketsFolderPath, ServerDomainName, ServerFolderPath, messagefrom, messageto);

                        sm.Set("pocketModel", result);
                    }
                }

                return result;
            }
        }

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

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult Index()
        {
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
                NameValueCollection qscoll = HttpUtility.ParseQueryString(HttpContext.Request.Url.Query);
                if (qscoll.Count > 0)
                {
                    string source = qscoll["source"];
                    string id = qscoll["id"];
                    if (source != null && id != null)
                    {
                        if (Pocket == null || id.ToLower() != Pocket.Id.ToString().ToLower())
                        {
                            SessionManager sm = new SessionManager();

                            string ServerFolderPath = Server.MapPath("/");
                            string AllPocketsFolderPath = ConfigurationManager.AppSettings["PocketPath"];
                            if (!String.IsNullOrEmpty(AllPocketsFolderPath))
                            {
                                AllPocketsFolderPath = ServerFolderPath + AllPocketsFolderPath;
                            }
                            string ServerDomainName = Request.Url.Authority;
                            PocketModel result = new PocketModel(new Guid(id), source, AllPocketsFolderPath, ServerDomainName, ServerFolderPath, "", "");

                            sm.Set("pocketModel", result);

                            return Redirect("/");//плохое решение - лучше бы как-то удалять параметры
                        }
                    }
                }
                if (Pocket == null)
                {
                    return RedirectToAction("Index", "Home");
                }

                string content = Pocket.GetContent(Request.Url, false);

                foreach (var ControlName in SharedControls)
                {
                    string template = RenderRazorViewToString(ControlName.Value, "");
                    content = content.Replace("@" + ControlName.Key, template);
                }

                return Content(content);
            }
            else if (ContentType == "application/javascript" || ContentType == "text/css")
            {
                string content = "";
                if (Pocket != null)
                {
                    content = Pocket.GetContent(Request.Url, true);
                }
                return new FileContentResult(Encoding.UTF8.GetBytes(content), ContentType);
            }
            else
            {
                Stream Stream = new MemoryStream();
                if (Pocket != null)
                {
                    Stream = Pocket.GetSourceFileStream(Request.Url);
                }
                return new FileStreamResult(Stream, ContentType);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Index(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();

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

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Init(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();

            string SourceUrl = collection["source"];

            Uri uriResult;
            if (Uri.TryCreate(SourceUrl, UriKind.Absolute, out uriResult) && uriResult.Scheme == Uri.UriSchemeHttp)
            {

                PocketModel result = null;

                SessionManager sm = new SessionManager();

                Guid Id = Guid.NewGuid();

                string ServerFolderPath = Server.MapPath("/");
                string AllPocketsFolderPath = ConfigurationManager.AppSettings["PocketPath"];
                if (!String.IsNullOrEmpty(AllPocketsFolderPath))
                {
                    AllPocketsFolderPath = ServerFolderPath + AllPocketsFolderPath;
                }
                string ServerDomainName = Request.Url.Authority;
                string messagefrom = ConfigurationManager.AppSettings["DefaultMessageFrom"];
                string messageto = "";
                result = new PocketModel(Id, SourceUrl, AllPocketsFolderPath, ServerDomainName, ServerFolderPath, messagefrom, messageto);

                sm.Set("pocketModel", result);

                jm.Object = result.CurrentProjectLink;
                jm.Result = true;
            }
            else
            {
                jm.Result = false;
                jm.Message = "Адрес сайта-образца определeн как некорректный: " + SourceUrl;
            }

            return Json(jm);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetConfig()
        {
            return Json(Pocket.ReplacementModel.EditableItems);
        }
    }
}
