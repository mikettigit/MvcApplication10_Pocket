using HtmlAgilityPack;
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
        public string Hash;
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
                Hash = xReplacementModel.Value.GetHashCode().ToString();
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
            return Replacement(source, false);
        }

        public string Repair(string source)
        {
            return Replacement(source, true);
        }

        private string Replacement(string source, bool repair)
        {
            string result = String.Copy(source);

            foreach (Replacement item in Items)
            {
                if (!String.IsNullOrEmpty(repair ? item.by : item.what))
                {
                    string CurrentWhat = Regex.Escape(repair ? item.by : item.what);

                    List<string> CurrentWhats = new List<string>();

                    if (item.target.ToLower() == "UpToClosingTag".ToLower())
                    {
                       try
                       {
                           HtmlDocument doc = new HtmlDocument();
                           doc.LoadHtml(result);
                           RecurseFindNodeTextsByOuterHtml(CurrentWhats, doc.DocumentNode, CurrentWhat);
                       }
                       finally
                       {
                       }
                    }

                    if (CurrentWhats.Count == 0)
                    {
                        CurrentWhats.Add(CurrentWhat);
                    }

                    foreach (var CurrentWhatsIterator in CurrentWhats)
                    {
                        CurrentWhat = CurrentWhatsIterator.Replace("\\r\\n", "");
                        var regex = new Regex(CurrentWhat);
                        result = regex.Replace(result.Replace("\r\n", "\n"), repair ? item.what : item.by);
                    }

                }
            }

            return result;
        }

        private void RecurseFindNodeTextsByOuterHtml(List<string> FindedTexts, HtmlNode Node, string what)
        {
            IEnumerable<HtmlNode> ChildElements = Node.ChildNodes.Where(node => node.NodeType == HtmlNodeType.Element);
            foreach (var n in ChildElements)
            {
                if (n.OuterHtml.Contains(what))
                {
                    if (!n.InnerHtml.Contains(what))
                    {
                        FindedTexts.Add(n.OuterHtml);
                    }
                    RecurseFindNodeTextsByOuterHtml(FindedTexts, n, what);
                }
            }
        }
    }
}