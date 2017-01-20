using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using System.Linq;

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

        private bool locked;

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

        public PocketModel(Guid _id, string _sourceurl, string _allpocketsfolderpath, string _serverdomainname, string _serverfolderpath, string _messagefrom, string _messageto, bool _locked = false)
        {
            id = _id;
            sourceurl = _sourceurl.TrimEnd('/');
            serverdomainname = _serverdomainname;
            serverfolderpath = _serverfolderpath;
            allpocketsfolderpath = _allpocketsfolderpath;

            messagefrom = _messagefrom;
            messageto = _messageto;
            locked = _locked;

            XElement xConfiguration = null;
            if (CacheMode)
            {
                if (File.Exists(ConfigFilePath))
                {
                    xConfiguration = XElement.Load(ConfigFilePath);
                    XElement xNotifications = xConfiguration.Element(XName.Get("Notifications"));
                    messagefrom = xNotifications.Element(XName.Get("MessageFrom")).Value;
                    messageto = xNotifications.Element(XName.Get("MessageTo")).Value;
                    XElement xLocked = xConfiguration.Element(XName.Get("Locked"));
                    if (xLocked != null)
                    {
                        locked = Convert.ToBoolean(xLocked.Value);
                    }
                }
                else
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(ConfigFilePath));
                    xConfiguration = CreateEmptyConfigFile(id, messagefrom, messageto, ConfigFilePath, locked);
                }
            }
            ReplacementModel = new ReplacementModel(xConfiguration);
            ReplacementModel.Items.Add(new Replacement(new Uri(sourceurl).Host, serverdomainname, "", true));
            
            EnhanceModel = new EnhanceModel(this);
        }

        private XElement CreateEmptyConfigFile(Guid _id, string _messagefrom, string _messageto, string _configfilepath, bool _locked = false)
        {
            XElement xConfiguration = new XElement("Configuration");
                XAttribute xId = new XAttribute("id", _id.ToString());
                xConfiguration.Add(xId);
                XElement xNotifications = new XElement("Notifications");
                    XElement XMessageFrom = new XElement("MessageFrom", _messagefrom);
                xNotifications.Add(XMessageFrom);
                    XElement XMessageTo = new XElement("MessageTo", _messageto);
                xNotifications.Add(XMessageTo);
                XElement XLocked = new XElement("Locked", _locked.ToString());
                xConfiguration.Add(XLocked);
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
    
                DirectoryInfo dInfo = Directory.CreateDirectory(Path.GetDirectoryName(path));

                var SearchPattern = new Regex(@"^(" + Path.GetFileName(path).Replace(ReplacementModel.Hash.ToString(), "") + @")(?!.*?\.(config|log)$)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                var filenames = dInfo.GetFiles().Where(f => SearchPattern.IsMatch(f.Name));
                foreach (var filename in filenames)
                {
                    filename.Delete();
                }

                using (var FileStream = new FileStream(path, FileMode.Create))
                {
                    MemoryStream.CopyTo(FileStream);
                    MemoryStream.Position = 0;
                }
            }
            catch{
            }
        }

        public string GetContent(Uri url, bool isJsOrCss)
        {
            string path = String.Format("{0}{1}", url.AbsolutePath, url.Query);
            string result = "";

            MemoryStream MemoryStream = new MemoryStream();
            string InstanceFilepath = "";
            string SampleFilepath = "";
            bool isFromSample = false;

            if (CacheMode)
            {
                InstanceFilepath = GetPocketFilePath(path, !isJsOrCss, true);
                MemoryStream = GetStreamFromPocket(InstanceFilepath);
                if (MemoryStream.Length == 0)
                {
                    SampleFilepath = GetPocketFilePath(path, !isJsOrCss, false);
                    MemoryStream = GetStreamFromPocket(SampleFilepath);
                    if (MemoryStream.Length != 0)
                    {
                        isFromSample = true;
                    }
                }
            }

            bool IsFromResponse = false;
            if (MemoryStream.Length == 0)
            {
                if (!locked)
                {
                    MemoryStream = GetStreamFromResponse(path);
                }
                else
                {
                    if (!String.IsNullOrEmpty(url.Query))
                    {
                        Uri NonQueryUrl = new Uri(String.Format("{0}{1}{2}{3}", url.Scheme, Uri.SchemeDelimiter, url.Authority, url.AbsolutePath));
                        return GetContent(NonQueryUrl, isJsOrCss);
                    }
                }
                IsFromResponse = true;
                if (CacheMode)
                {
                    try
                    {
                        File.AppendAllText(LogFilePath, DateTime.Now + "\t" + path + (locked ? "\t[locked]" : "") + "\r\n"); 
                    }
                    catch { }
                }
            }

            StreamReader MemoryStreamReader = new StreamReader(MemoryStream);
            result = MemoryStreamReader.ReadToEnd();

            if (IsFromResponse || isFromSample)
            {
                if (!isFromSample)
                {
                    if (!isJsOrCss) { 
                        result = EnhanceModel.Enhance(result);
                    }
                    if (CacheMode)
                    {
                        byte[] byteArray = Encoding.UTF8.GetBytes(result);
                        SetStreamToPocket(new MemoryStream(byteArray), SampleFilepath);
                    }
                }

                if (ReplacementModel.Hash != 0) {
                    result = ReplacementModel.Replace(result);
                    if (CacheMode)
                    {
                        byte[] byteArray = Encoding.UTF8.GetBytes(result);
                        SetStreamToPocket(new MemoryStream(byteArray), InstanceFilepath);
                    }
                }
            }

            return result;
        }

        public MemoryStream GetSourceFileStream(Uri url)
        {
            string path = String.Format("{0}{1}", url.AbsolutePath, url.Query);

            MemoryStream MemoryStream = new MemoryStream();
            string InstanceFilepath = "";

            if (CacheMode)
            {
                InstanceFilepath = GetPocketFilePath(path, false, false);
                MemoryStream = GetStreamFromPocket(InstanceFilepath);
            }

            bool IsFromResponse = false;
            if (MemoryStream.Length == 0)
            {
                if (!locked)
                {
                    MemoryStream = GetStreamFromResponse(path);
                }
                else
                {
                    if (!String.IsNullOrEmpty(url.Query))
                    {
                        Uri NonQueryUrl = new Uri(String.Format("{0}{1}{2}{3}", url.Scheme, Uri.SchemeDelimiter, url.Authority, url.AbsolutePath));
                        return GetSourceFileStream(NonQueryUrl);
                    }
                }
                IsFromResponse = true;
                if (CacheMode)
                {
                    try
                    {
                        File.AppendAllText(LogFilePath, DateTime.Now + "\t" + path + (locked ? "\t[locked]" : "") + "\r\n");
                    }
                    catch { }
                }
            }

            if (CacheMode && IsFromResponse)
            {
                SetStreamToPocket(MemoryStream, InstanceFilepath);
            }

            return MemoryStream;
        }
  
    }
}