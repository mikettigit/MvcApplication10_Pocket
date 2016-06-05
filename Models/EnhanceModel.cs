using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace MvcApplication10.Models
{
    public class EnhanceModel
    {
        public List<string> Scripts;
        public List<string> Styles;
        public List<string> Others;

        public EnhanceModel(string serverpath)
        {
            Others = new List<string>();

            Styles = new List<string>();
            string[] stylefilepaths = Directory.GetFiles(serverpath + "styles\\");
            stylefilepaths.OrderBy(item => item);
            foreach (var stylefilepath in stylefilepaths)
            {
                FileInfo fi = new FileInfo(stylefilepath);
                Styles.Add("<link rel=\"stylesheet\" href=\"/Home/Styles/" + fi.Name + "\" type=\"text/css\" />");
            }

            Scripts = new List<string>();
            string[] scriptfilepaths = Directory.GetFiles(serverpath + "scripts\\");
            scriptfilepaths = scriptfilepaths.OrderBy(item => item).ToArray();
            foreach (var scriptfilepath in scriptfilepaths)
            {
                FileInfo fi = new FileInfo(scriptfilepath);
                Scripts.Add("<script src=\"/Home/Scripts/" + fi.Name + "\" type=\"text/javascript\"></script>");
            }
        }

        public string Enhance(string source)
        {
            string result = String.Copy(source);

            string enhanceString = "";

            foreach (string script in Scripts)
            {
                enhanceString += script;
            }

            foreach (string style in Styles)
            {
                enhanceString += style;
            }

            var regex = new Regex(Regex.Escape("</body"), RegexOptions.IgnoreCase);
            result = regex.Replace(result, enhanceString + "</body");

            return result;
        }
    }
}