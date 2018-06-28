using HtmlAgilityPack;
using MvcApplication10.Helpers;
using MvcApplication10.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace MvcApplication10.Controllers
{
    public class AdminController : ControllerWrapper
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
            
            jm.Message = "Пароль не соответствует логину...";
            if (collection["password"] == ConfigurationManager.AppSettings["Password"] || collection["password"].GetHashCode().ToString() == ConfigurationManager.AppSettings["PasswordHash"])
            {
                jm.Message = "Ok";
                jm.Result = true;
                Pocket.AdminModel.Active = true;
            }
            
            return Json(jm);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Logout(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();
            jm.Message = "Сейчас страница будет обновлена...";
            jm.Result = true;
            Pocket.AdminModel.Active = false;
            return Json(jm);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveAll(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();

            if (Pocket.AdminModel.Active == true)
            {
                Uri FromUrlValue = new Uri(collection["from URL"]);
                string SampleFilepath = Pocket.GetPocketFilePath(GetClearRequestPath(FromUrlValue.AbsolutePath, FromUrlValue.Query), true, false);

                string Content = Encoding.UTF8.GetString(Convert.FromBase64String(collection["content"]));

                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(Content);
                var nodes = doc.DocumentNode.SelectNodes("//div[@id='2fea14ff-d8e3-42c1-a230-3917b7a640c9']");
                if (nodes != null)
                {
                    foreach (var node in nodes)
                    {
                        node.ParentNode.RemoveChild(node);
                    }
                }
                Content = doc.DocumentNode.OuterHtml;

                Content = Content.Replace(Pocket.AdminModel.OpeningCommentBracket, "").Replace(Pocket.AdminModel.ClosingCommentBracket, "");

                System.IO.File.WriteAllText(SampleFilepath, Content);

                jm.Message = "Сохранено";
                jm.Result = true;
            }

            return Json(jm);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadImage(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();

            jm.Result = false;

            if (Pocket.AdminModel.Active == true)
            {
                if (Request.Files.Count > 0)
                {
                    HttpPostedFileBase hpf = Request.Files[0] as HttpPostedFileBase;
                    if (hpf.ContentLength > 0)
                    {
                        string path = "/2fea14ff-d8e3-42c1-a230-3917b7a640c9/" + Guid.NewGuid().ToString() + Path.GetExtension(hpf.FileName);
                        string ImageFilename = Pocket.GetPocketFilePath(path, false, false);

                        string target = collection["target"];
                        if (Uri.IsWellFormedUriString(target, UriKind.Absolute))
                        {
                            target = new Uri(target).PathAndQuery;
                        }
                        Image objImage = Image.FromFile(Pocket.GetPocketFilePath(target, false, false));

                        Directory.CreateDirectory(Path.GetDirectoryName(ImageFilename));

                        ImageResizer.Proceed(hpf.InputStream, ImageFilename, objImage.Width, objImage.Height);

                        jm.Result = true;
                        jm.Message = path;
                    }
                }
            }

            return Json(jm);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Reset(FormCollection collection)
        {
            JsonMessage jm = new JsonMessage();
            jm.Message = "Состояние модели сброшено...";
            jm.Result = true;
            Pocket = null;
            return Json(jm);
        }
    }
}
