using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class PocketController : Controller
    {
        //
        // GET: /Pocket/

        protected PocketModel Pocket { 
            get {
                PocketModel result = null;

                SessionManager sm = new SessionManager();

                object pocketModel = sm.Get("pocketModel");
                if (pocketModel != null)
                {
                    result = pocketModel as PocketModel;
                }
                else
                {
                    string serverpath = Server.MapPath("/");
                    string source = ConfigurationManager.AppSettings["PocketSource"];
                    string pocketpath = ConfigurationManager.AppSettings["PocketPath"];
                    if (!String.IsNullOrEmpty(pocketpath)) 
                    {
                        pocketpath = serverpath + pocketpath;
                    }
                    string authority = Request.Url.Authority;
                    result = new PocketModel(source, pocketpath, authority, serverpath);

                    sm.Set("pocketModel", result);
                }

                return result;
            } 
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult Index()
        {
            if ((Request.AcceptTypes.Length == 1 && Request.AcceptTypes[0] == "*/*")
               || Request.AcceptTypes.Any(r => r.ToLower() == "text/html")
               || Request.AcceptTypes.Any(r => r.ToLower() == "text/plain")
               || Request.AcceptTypes.Any(r => r.ToLower() == "application/xhtml+xml")
               || Request.AcceptTypes.Any(r => r.ToLower() == "application/xml")) 
            {
                string content = Pocket.GetContent(Request.RawUrl);
                return Content(content);
            }
            else
            {
                Stream Stream = Pocket.GetSourceFileStream(Request.RawUrl);
                string ContentType = "*/*";
                if (Request.AcceptTypes.Length > 0)
                {
                    ContentType = Request.AcceptTypes[0];
                }
                return new FileStreamResult(Stream, ContentType);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Index(FormCollection collection)
        {
            //чтение файлов

            JsonMessage jm = new JsonMessage();
            
            try
            {
                string subject = "Сообщение c сайта " + Pocket.ServerHost;
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
                mailObj.From = new MailAddress(ConfigurationManager.AppSettings["messageFrom"]);
                mailObj.To.Add(ConfigurationManager.AppSettings["messageTo"]);
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

            return Json(jm);
        }

    }
}
