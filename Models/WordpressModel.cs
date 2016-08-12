using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Net;
using System.IO;
using System.Text;
using System.Xml;
using System.Web.Razor;

namespace MvcApplication10.Models
{
    public class WordpressCategory
    {
        public string Name;
        public string Translate;

        public WordpressCategory()
        {
            Name = "";
            Translate = "";
        }
    }

    public class WordpressPost
    {
        public string Id;
        public string Title;
        public string Description;
        public string Content;
        public string Meta_Keywords;
        public string Meta_Description;
        public string Meta_Title;
        public DateTime Date;
        public string DateString
        {
            get { return Date.ToString("dd.MM.yyyy"); }
        }

        public WordpressPost()
        {
            Id = "";
            Title = "";
            Description = "";
            Content = "";
            Meta_Keywords = "";
            Meta_Description = "";
            Date = DateTime.MinValue;
        }
    }

    public class WordpressModel
    {

        private string AdminURL;

        public WordpressModel(string _adminURL)
        {
            AdminURL = _adminURL.TrimEnd('/') + "/";
        }

        public string GetListXml(string CategoryName, string PageId)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(AdminURL + "category/" + CategoryName + "/feed/" + (String.IsNullOrEmpty(PageId) ? "" : "?page=" + PageId));
            request.Method = "POST";
            request.Proxy.Credentials = CredentialCache.DefaultCredentials;
            request.ContentLength = 0;
            //request.Timeout = 10;

            string xml = "";

            try
            { 
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                xml = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding("UTF-8")).ReadToEnd();
            }
            catch (Exception e)
            {
            }

            return xml; 
        }

        public WordpressCategory ParseCategory(string xml)
        {
            WordpressCategory result = new WordpressCategory();

            if (!String.IsNullOrEmpty(xml))
            {
                XmlDocument xDocument = new XmlDocument();
                xDocument.InnerXml = xml;

                result.Translate = result.Name;
                XmlNode NodeCategoryTitle = xDocument.SelectSingleNode("//channel/title");
                if (NodeCategoryTitle != null)
                {
                    result.Translate = NodeCategoryTitle.InnerText;
                }
            }

            return result;
        }

        public List<WordpressPost> ParseList(string xml)
        {
            List<WordpressPost> result = new List<WordpressPost>();

            if (!String.IsNullOrEmpty(xml))
            {
                XmlDocument xDocument = new XmlDocument();
                xDocument.InnerXml = xml;

                XmlNodeList Nodes = xDocument.SelectNodes("//item");
                foreach (XmlNode Node in Nodes)
                {
                    WordpressPost post = new WordpressPost();

                    XmlNode NodeId = Node.SelectSingleNode("id");
                    if (NodeId != null)
                    {
                        post.Id = NodeId.InnerText;
                    }

                    XmlNode NodeTitle = Node.SelectSingleNode("title");
                    if (NodeTitle != null)
                    {
                        post.Title = NodeTitle.InnerText;
                    }

                    XmlNode NodeDate = Node.SelectSingleNode("pubDate");
                    if (NodeDate != null)
                    {
                        post.Date = Convert.ToDateTime(NodeDate.InnerText);
                    }

                    XmlNode NodeDescription = Node.SelectSingleNode("description");
                    if (NodeDescription != null)
                    {
                        post.Description = NodeDescription.InnerText;
                    }

                    result.Add(post);
                }
            }
            return result;
        }

        public WordpressPost GetItem(string Id)
        {
            WordpressPost result = new WordpressPost();

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(AdminURL + Id + "/feed/");
            request.Method = "POST";
            request.Proxy.Credentials = CredentialCache.DefaultCredentials;
            request.ContentLength = 0;
            //request.Timeout = 10;

            string xml = "";

            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                xml = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding("UTF-8")).ReadToEnd();
            }
            catch (Exception e)
            {
                result.Id = Id;
                result.Description = "Error reading data - " + request.RequestUri.AbsoluteUri;
                result.Content = result.Description;
            }

            if (!String.IsNullOrEmpty(xml))
            {
                XmlDocument xDocument = new XmlDocument();
                xDocument.InnerXml = xml;

                XmlNamespaceManager nsmgr = new XmlNamespaceManager(xDocument.NameTable);
                nsmgr.AddNamespace("content", "http://purl.org/rss/1.0/modules/content/");

                XmlNode Node = xDocument.SelectSingleNode("//item");
                if (Node != null)
                {
                    XmlNode NodeId = Node.SelectSingleNode("id");
                    if (NodeId != null)
                    {
                        result.Id = NodeId.InnerText;
                    }

                    XmlNode NodeTitle = Node.SelectSingleNode("title");
                    if (NodeTitle != null)
                    {
                        result.Title = NodeTitle.InnerText;
                    }

                    XmlNode NodeDate = Node.SelectSingleNode("pubDate");
                    if (NodeDate != null)
                    {
                        try
                        {
                            result.Date = Convert.ToDateTime(NodeDate.InnerText);
                        }
                        catch
                        {
                            result.Date = DateTime.Now;
                        }
                    }

                    XmlNode NodeDescription = Node.SelectSingleNode("description");
                    if (NodeDescription != null)
                    {
                        result.Description = NodeDescription.InnerText;
                    }

                    XmlNode NodeContent = Node.SelectSingleNode("content:encoded", nsmgr);
                    if (NodeContent != null)
                    {
                        result.Content = NodeContent.InnerText;
                        if (String.IsNullOrEmpty(result.Content))
                        {
                            result.Content = result.Description;
                        }
                    }

                    XmlNode NodeMetaDescription = Node.SelectSingleNode("meta_decription");
                    if (NodeMetaDescription != null)
                    {
                        result.Meta_Description = NodeMetaDescription.InnerText;
                    }

                    XmlNode NodeMetaKeywords = Node.SelectSingleNode("meta_keywords");
                    if (NodeMetaKeywords != null)
                    {
                        result.Meta_Keywords = NodeMetaKeywords.InnerText;
                    }

                    XmlNode NodeMetaTitle = Node.SelectSingleNode("meta_title");
                    if (NodeMetaTitle != null)
                    {
                        result.Meta_Title = NodeMetaTitle.InnerText;
                    }
                }
            }
            return result;
        }

        public string ProceedContent(string content)
        {
            RazorEngineHost host = new RazorEngineHost(new CSharpRazorCodeLanguage());
            host.NamespaceImports.Add("MvcApplication10.Models");
            RazorTemplateEngine razor = new RazorTemplateEngine(host);
            using (TextReader textreader = new StringReader(content + "@\"теститести\""))
            {
                return razor.GenerateCode(textreader).ToString();
            }
        }

    }
}