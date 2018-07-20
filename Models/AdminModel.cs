using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MvcApplication10.Models
{
    public class AdminModel
    {
        public bool Active;
        public string Id = "2fea14ff-d8e3-42c1-a230-3917b7a640c9";
        public string OpeningCommentBracket
        {
            get
            {
                return "<!--<" + Id + ">";
            }
        }
        public string ClosingCommentBracket 
        {
            get
            {
                return "</" + Id + ">-->";
            }
        }

        public AdminModel()
        {
            Active = false;
        }
    }
}