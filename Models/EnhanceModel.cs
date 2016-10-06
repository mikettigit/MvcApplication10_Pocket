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
        private PocketModel parent;

        public List<string> Sheets;

        public EnhanceModel(PocketModel _parent)
        {
            parent = _parent;
            Sheets = new List<string>();
            AddSheets(_parent.ServerFolderPath + "Sheets\\");
            if (parent.Id != Guid.Empty)
            {
                AddSheets(_parent.ServerFolderPath + "Sheets\\ForTrials\\");
            }
        }

        private void AddSheets(string FolderPath)
        {
            string[] sheetfilepaths = Directory.GetFiles(FolderPath);
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