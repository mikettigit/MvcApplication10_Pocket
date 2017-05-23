using HtmlAgilityPack;
using System;
using System.Drawing;
using System.IO;

namespace MvcApplication10.Helpers
{
    public static class HtmlBeautifier
    {
        public static void Proceed(ref string html)
        {
            if (String.IsNullOrWhiteSpace(html))
            {
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(html);
                html = doc.DocumentNode.OuterHtml;
            }
        }
    }
}