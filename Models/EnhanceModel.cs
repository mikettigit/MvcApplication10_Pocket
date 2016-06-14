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
        //public List<string> Styles;
        //public List<string> Scripts;
        public List<string> Sheets;

        public EnhanceModel(string serverpath)
        {
            //Styles = new List<string>();
            //string[] stylefilepaths = Directory.GetFiles(serverpath + "styles\\");
            //stylefilepaths.OrderBy(item => item);
            //foreach (var stylefilepath in stylefilepaths)
            //{
            //    FileInfo fi = new FileInfo(stylefilepath);
            //    Styles.Add("<link rel=\"stylesheet\" href=\"/Home/Styles/" + fi.Name + "\" type=\"text/css\" />");
            //}

            //Scripts = new List<string>();
            //string[] scriptfilepaths = Directory.GetFiles(serverpath + "scripts\\");
            //scriptfilepaths = scriptfilepaths.OrderBy(item => item).ToArray();
            //foreach (var scriptfilepath in scriptfilepaths)
            //{
            //    FileInfo fi = new FileInfo(scriptfilepath);
            //    Scripts.Add("<script src=\"/Home/Scripts/" + fi.Name + "\" type=\"text/javascript\"></script>");
            //}

            Sheets = new List<string>();
            string[] sheetfilepaths = Directory.GetFiles(serverpath + "sheets\\");
            sheetfilepaths.OrderBy(item => item);
            foreach (var sheetfilepath in sheetfilepaths)
            {
                Sheets.Add(File.ReadAllText(sheetfilepath));
            }
        }

        public string Enhance(string source)
        {
            string result = String.Copy(source);

            string enhanceString = "";

            //foreach (string style in Styles)
            //{
            //    enhanceString += style;
            //}

            //foreach (string script in Scripts)
            //{
            //    enhanceString += script;
            //}

            foreach (string sheet in Sheets)
            {
                enhanceString += sheet;
            }

            var regex = new Regex(Regex.Escape("</body"), RegexOptions.IgnoreCase);
            result = regex.Replace(result, enhanceString + "</body");

            return result;
        }
    }
}