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
        public bool predefined;

        public Replacement(string _what, string _by, string _target, bool _predefined = false)
        {
            what = _what;
            by = _by;
            target = _target;
            predefined = _predefined;
        }
    }

    public class ReplacementModel
    {
        public int Hash;
        public List<Replacement> Items;

        public IEnumerable<Replacement> EditableItems
        {
            get
            {
                return Items.Where(item => !item.predefined);
            }
        }

        public ReplacementModel(XElement xConfiguration)
        {
            Items = new List<Replacement>();
            if (xConfiguration != null)
            {
                XElement xReplacementModel = xConfiguration.Element(XName.Get("ReplacementModel"));
                Hash = xReplacementModel.Value.GetHashCode();
                IEnumerable<XElement> xReplacements = xReplacementModel.Elements(XName.Get("Replacement"));
                foreach (XElement xReplacement in xReplacements)
                {
                    string what = xReplacement.Element(XName.Get("what")).Value;
                    string by = xReplacement.Element(XName.Get("by")).Value;
                    string target = xReplacement.Attribute(XName.Get("target")).Value;
                    Items.Add(new Replacement(what, by, target));
                }
            }
        }

        public string Replace(string source)
        {
            return Replacement(source, true);
        }

        public string Repair(string source)
        {
            return Replacement(source, false);
        }

        private string Replacement(string source, bool forward)
        {
            string result = String.Copy(source);

            foreach (Replacement item in Items)
            {
                if (!String.IsNullOrEmpty(forward ? item.what : item.by))
                {
                    string CurrentWhat = Regex.Escape(forward ? item.what : item.by);
                    CurrentWhat = CurrentWhat.Replace("\\r\\n", "");
                    var regex = new Regex(CurrentWhat);
                    result = regex.Replace(result.Replace("\r\n", "\n"), forward ? item.by : item.what);
                }
            }

            return result;
        }
    }
}