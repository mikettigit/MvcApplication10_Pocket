using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Xml.Linq;

namespace MvcApplication10.Models
{
    public class Replacement
    {
        public string what;
        public string by;
        public string target;

        public Replacement(string _what, string _by, string _target)
        {
            what = _what;
            by = _by;
            target = _target;
        }
    }

    public class ReplacementModel
    {
        public int Hash;
        public List<Replacement> Items;

        public ReplacementModel(string configfilepath)
        {
            Items = new List<Replacement>();
            if (File.Exists(configfilepath))
            {
                XElement xDoc = XElement.Load(configfilepath);
                XElement ReplacementModelNode = xDoc.Element(XName.Get("ReplacementModel"));
                if (ReplacementModelNode != null)
                {
                    Hash = ReplacementModelNode.Value.GetHashCode();
                    IEnumerable<XElement> Replacements = ReplacementModelNode.Elements(XName.Get("Replacement"));
                    foreach (XElement xReplacement in Replacements)
                    {
                        string what = xReplacement.Element(XName.Get("what")).Value;
                        string by = xReplacement.Element(XName.Get("by")).Value;
                        string target = xReplacement.Attribute(XName.Get("target")).Value;
                        Items.Add(new Replacement(what, by, target));
                    }
                }
            }
        }

        public string Replace(string source)
        {
           string result = String.Copy(source);

           foreach (Replacement item in Items) {
               string CurrentWhat = Regex.Escape(item.what);
               CurrentWhat = CurrentWhat.Replace("\\r\\n","");
               var regex = new Regex(CurrentWhat, RegexOptions.IgnoreCase);
               result = regex.Replace(result.Replace("\r\n","\n"), item.by);
           }

           return result;
        }
    }
}