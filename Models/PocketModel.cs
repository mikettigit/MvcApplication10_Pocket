using System;
using System.IO;
using System.Net;
using System.Text;

namespace MvcApplication10.Models
{
    public class PocketModel
    {
        private string serverpath;
        private string serverhost;
        
        private string pocketpath;

        private string source;

        public string ServerHost
        {
            get {
                return serverhost;
            }
        }

        public string PocketPath
        {
            get
            {
                return pocketpath;
            }
        }

        public bool CacheMode { 
            get 
            {
                return !String.IsNullOrEmpty(pocketpath);
            } 
        }

        private string ConfigFilePath {
            get
            {
                Uri uri = new Uri(source);
                return pocketpath + uri.Host + "\\" + uri.Host + ".config";
            }
        } 

        private ReplacementModel ReplacementModel;
        private EnhanceModel EnhanceModel;

        public PocketModel(string _source, string _pocketpath, string _serverhost, string _serverpath)
        {
            source = _source;
            serverhost = _serverhost;
            serverpath = _serverpath;
            pocketpath = _pocketpath;

            ReplacementModel = new ReplacementModel(ConfigFilePath);
            ReplacementModel.Items.Add(new Replacement(new Uri(source).Host, serverhost, ""));
            
            EnhanceModel = new EnhanceModel(serverpath);
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

            Uri uri = new Uri(source + path);

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

            Uri uri = new Uri(source + path);

            string SiteFolder = pocketpath + uri.Host;
            result = SiteFolder + uri.PathAndQuery;
            if (isContent)
            {
                result = result + (uri.PathAndQuery.EndsWith("/") ? "" : "/") + uri.Host;
                if (isHashed)
                {
                    result = result + "_" + ReplacementModel.Hash.ToString();
                }
            }
            else {
                if (uri.PathAndQuery.EndsWith("/"))
                {
                    result = result.Substring(0, result.Length - 1);
                }
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

        public string GetContent(string path)
        {
            string result = "";

            MemoryStream MemoryStream = new MemoryStream();
            string CurrentPocketFilePath = "";
            string GeneralPocketFilePath = "";
            bool isFromGeneral = false;

            if (CacheMode)
            {
                CurrentPocketFilePath = GetPocketFilePath(path, true, true);
                MemoryStream = GetStreamFromPocket(CurrentPocketFilePath);
                if (MemoryStream.Length == 0)
                {
                    GeneralPocketFilePath = GetPocketFilePath(path, true, false);
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
            }

            StreamReader MemoryStreamReader = new StreamReader(MemoryStream);
            result = MemoryStreamReader.ReadToEnd();

            if (IsFromResponse || isFromGeneral)
            {
                if (!isFromGeneral)
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
            }

            if (CacheMode && IsFromResponse)
            {
                SetStreamToPocket(MemoryStream, CurrentPocketFilePath);
            }

            return MemoryStream;
        }
    }
}