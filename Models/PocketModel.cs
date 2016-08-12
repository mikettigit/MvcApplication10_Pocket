using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace MvcApplication10.Models
{
    public class PocketModel
    {
        private Guid id;

        private string serverdomainname;
        private string serverfolderpath;

        private string allpocketsfolderpath;

        private string sourceurl;

        private string messagefrom;
        private string messageto;

        public Guid Id
        {
            get {
                return id;
            }
        }

        public string ServerDomainName
        {
            get {
                return serverdomainname;
            }
        }

        public string CurrentProjectLink
        {
            get
            {
                return "http://" + ServerDomainName + "?source=" + HttpUtility.HtmlEncode(sourceurl) + "&id=" + id.ToString();
            }
        }
              
        public bool CacheMode{ 
            get 
            {
                return !String.IsNullOrEmpty(allpocketsfolderpath);
            } 
        }

        public string MessageFrom
        {
            get
            {
                return messagefrom;
            }
        }

        public string MessageTo
        {
            get
            {
                return messageto;
            }
        }

        public string ServerFolderPath
        {
            get
            {
                return serverfolderpath;
            }
        }

        public string AllPocketsFolderPath
        {
            get
            {
                return allpocketsfolderpath;
            }
        }

        public string CurrentPocketFolderPath
        {
            get
            {
                Uri uri = new Uri(sourceurl);
                return AllPocketsFolderPath + uri.Host + (Id == Guid.Empty ? "" : "_" + Id.ToString()) + "\\";
            }
        }

        public string ConfigFilePath
        {
            get
            {
                Uri uri = new Uri(sourceurl);
                return CurrentPocketFolderPath + uri.Host + ".config";
            }
        }

        private string LogFilePath
        {
            get
            {
                Uri uri = new Uri(sourceurl);
                return CurrentPocketFolderPath + uri.Host + ".log";
            }
        } 

        public ReplacementModel ReplacementModel;
        private EnhanceModel EnhanceModel;

        public PocketModel(Guid _id, string _sourceurl, string _allpocketsfolderpath, string _serverdomainname, string _serverfolderpath, string _messagefrom, string _messageto)
        {
            id = _id;
            sourceurl = _sourceurl.TrimEnd('/');
            serverdomainname = _serverdomainname;
            serverfolderpath = _serverfolderpath;
            allpocketsfolderpath = _allpocketsfolderpath;

            messagefrom = _messagefrom;
            messageto = _messageto;

            XElement xConfiguration = null;
            if (CacheMode)
            {
                if (File.Exists(ConfigFilePath))
                {
                    xConfiguration = XElement.Load(ConfigFilePath);
                    XElement xNotifications = xConfiguration.Element(XName.Get("Notifications"));
                    messagefrom = xNotifications.Element(XName.Get("MessageFrom")).Value;
                    messageto = xNotifications.Element(XName.Get("MessageTo")).Value;
                }
                else
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(ConfigFilePath));
                    xConfiguration = CreateEmptyConfigFile(id, messagefrom, messageto, ConfigFilePath);
                }
            }
            ReplacementModel = new ReplacementModel(xConfiguration);
            ReplacementModel.Items.Add(new Replacement(new Uri(sourceurl).Host, serverdomainname, "", true));
            
            EnhanceModel = new EnhanceModel(this);
        }

        private XElement CreateEmptyConfigFile(Guid _id, string _messagefrom, string _messageto, string _configfilepath)
        {
            XElement xConfiguration = new XElement("Configuration");
                XAttribute xId = new XAttribute("id", _id.ToString());
                xConfiguration.Add(xId);
                XElement xNotifications = new XElement("Notifications");
                    XElement XMessageFrom = new XElement("MessageFrom", _messagefrom);
                xNotifications.Add(XMessageFrom);
                    XElement XMessageTo = new XElement("MessageTo", _messageto);
                xNotifications.Add(XMessageTo);
            xConfiguration.Add(xNotifications);
                XElement xReplacementModel = new XElement("ReplacementModel");
                    XElement xReplacement = new XElement("Replacement");
                        XAttribute xTarget = new XAttribute("target", "all");
                        xReplacement.Add(xTarget);
                        XElement xWhat = new XElement("what");
                            xWhat.Add(new XCData(""));
                        xReplacement.Add(xWhat);
                        XElement xBy = new XElement("by");
                            xBy.Add(new XCData(""));
                        xReplacement.Add(xBy);
                xReplacementModel.Add(xReplacement);
            xConfiguration.Add(xReplacementModel);
            xConfiguration.Save(_configfilepath);

            return xConfiguration;
        }

        private HttpWebResponse GetResponse(Uri uri)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
            request.Method = "GET";
            request.Proxy.Credentials = CredentialCache.DefaultCredentials;
            request.ContentLength = 0;

            try
            {
                return (HttpWebResponse)request.GetResponse();
            }
            catch (Exception)
            {
            }

            return null;
        }

        private MemoryStream GetStreamFromResponse(string path)
        {
            MemoryStream result = new MemoryStream();

            Uri uri = new Uri(sourceurl + ReplacementModel.Repair(path));

            HttpWebResponse response = GetResponse(uri);
            if (response != null)
            {
                Stream ResponseStream = response.GetResponseStream();
                ResponseStream.CopyTo(result);
                result.Position = 0;
            }

            return result;
        }

        private string GetPocketFilePath(string path, bool isContent, bool isHashed)
        {
            string result = "";

            Uri uri = new Uri(sourceurl + path);

            result = CurrentPocketFolderPath + uri.PathAndQuery;
            if (isContent)
            {
                result = result + (uri.PathAndQuery.EndsWith("/") ? "" : "/") + uri.Host;
            }
            else {
                result = result.Trim('/');
            }
            if (isHashed)
            {
                result = result + "_" + ReplacementModel.Hash.ToString();
            }
            result = result.Replace('/', '\\');
            result = result.Replace('?', '&');

            return result;
        }

        private MemoryStream GetStreamFromPocket(string path)
        {
            MemoryStream result = new MemoryStream();
            
            if (File.Exists(path))
            {
                using (var FileStream = new FileStream(path, FileMode.Open))
                {
                    FileStream.CopyTo(result);
                    result.Position = 0;
                }
            }
    
            return result;
        }

        private void SetStreamToPocket(MemoryStream MemoryStream, string path)
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(path));
                using (var FileStream = new FileStream(path, FileMode.Create))
                {
                    MemoryStream.CopyTo(FileStream);
                    MemoryStream.Position = 0;
                }
            }
            catch{
            }
        }

        public string GetContent(string path, bool isJsOrCss)
        {
            string result = "";

            MemoryStream MemoryStream = new MemoryStream();
            string CurrentPocketFilePath = "";
            string GeneralPocketFilePath = "";
            bool isFromGeneral = false;

            if (CacheMode)
            {
                CurrentPocketFilePath = GetPocketFilePath(path, !isJsOrCss, true);
                MemoryStream = GetStreamFromPocket(CurrentPocketFilePath);
                if (MemoryStream.Length == 0)
                {
                    GeneralPocketFilePath = GetPocketFilePath(path, !isJsOrCss, false);
                    MemoryStream = GetStreamFromPocket(GeneralPocketFilePath);
                    if (MemoryStream.Length != 0)
                    {
                        isFromGeneral = true;
                    }
                }
            }

            bool IsFromResponse = false;
            if (MemoryStream.Length == 0)
            {
                MemoryStream = GetStreamFromResponse(path);
                IsFromResponse = true;
                if (CacheMode)
                {
                    try
                    { 
                        File.AppendAllText(LogFilePath, DateTime.Now + "\t" + path + "\r\n"); 
                    }
                    catch { }
                }
            }

            StreamReader MemoryStreamReader = new StreamReader(MemoryStream);
            result = MemoryStreamReader.ReadToEnd();

            if (IsFromResponse || isFromGeneral)
            {
                if (!isFromGeneral && !isJsOrCss)
                {
                    result = EnhanceModel.Enhance(result);
                    if (CacheMode)
                    {
                        byte[] byteArray = Encoding.UTF8.GetBytes(result);
                        SetStreamToPocket(new MemoryStream(byteArray), GeneralPocketFilePath);
                    }
                }

                if (ReplacementModel.Hash != 0) {
                    result = ReplacementModel.Replace(result);
                    if (CacheMode)
                    {
                        byte[] byteArray = Encoding.UTF8.GetBytes(result);
                        SetStreamToPocket(new MemoryStream(byteArray), CurrentPocketFilePath);
                    }
                }
            }

            return result;
        }

        public MemoryStream GetSourceFileStream(string path)
        {
            MemoryStream MemoryStream = new MemoryStream();
            string CurrentPocketFilePath = "";

            if (CacheMode)
            {
                CurrentPocketFilePath = GetPocketFilePath(path, false, false);
                MemoryStream = GetStreamFromPocket(CurrentPocketFilePath);
            }

            bool IsFromResponse = false;
            if (MemoryStream.Length == 0)
            {
                MemoryStream = GetStreamFromResponse(path);
                IsFromResponse = true;
                if (CacheMode)
                {
                    try
                    {
                        File.AppendAllText(LogFilePath, DateTime.Now + "\t" + path + "\r\n");
                    }
                    catch { }
                }
            }

            if (CacheMode && IsFromResponse)
            {
                SetStreamToPocket(MemoryStream, CurrentPocketFilePath);
            }

            return MemoryStream;
        }
  
    }
}