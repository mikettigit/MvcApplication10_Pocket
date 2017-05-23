﻿using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using MvcApplication10.Helpers;

namespace MvcApplication10.Models
{
    public class Replacement
    {
        public string what;
        public string xpath;
        public string by;
        public string target;
        public bool predefined;

        public Replacement(string _what, string _xpath, string _by, string _target, bool _predefined = false)
        {
            what = _what;
            xpath = _xpath;
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
                    XElement xWhat = xReplacement.Element(XName.Get("what"));
                    string what = xWhat.Value;
                    string xpath = xWhat.Attribute(XName.Get("xpath")).Value;
                    string by = xReplacement.Element(XName.Get("by")).Value;
                    string target = xReplacement.Attribute(XName.Get("target")).Value;
                    Items.Add(new Replacement(what, xpath, by, target));
                }
            }
        }

        public string Replace(string source, string target)
        {
            return Replacement(source, target, false);
        }

        public string Repair(string source)
        {
            return Replacement(source, source, true);
        }

        private string Replacement(string source, string target, bool repair)
        {
            string result = String.Copy(source);

            foreach (Replacement item in Items)
            {
                if (repair && !item.xpath.IsEmpty())
                {
                    continue;
                }

                if (item.target.IsEmpty() || item.target.Equals(target, StringComparison.OrdinalIgnoreCase))
                {
                    string CurrentWhat = repair ? item.by : item.what;
                    string CurrentBy = repair ? item.what : item.by;

                    if (item.xpath.IsEmpty())
                    {
                        if (!CurrentWhat.IsEmpty())
                        {
                            result = result.Replace(CurrentWhat, CurrentBy);
                        }
                    }
                    else
                    {
                        HtmlDocument doc = new HtmlDocument();
                        doc.LoadHtml(result);
                        var nodes = doc.DocumentNode.SelectNodes(item.xpath);
                        foreach (var node in nodes)
                        {
                            string Pattern = CurrentBy;
                            if (!CurrentWhat.IsEmpty())
                            {
                                Pattern = node.OuterHtml;
                                Pattern = Pattern.Replace(CurrentWhat, CurrentBy);
                            }
                            var newNode = HtmlNode.CreateNode(Pattern);
                            node.ParentNode.ReplaceChild(newNode, node);
                        }
                        result = doc.DocumentNode.OuterHtml;
                    }
                }
            }

            return result;
        }

    }
}