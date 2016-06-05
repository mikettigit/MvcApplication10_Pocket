using System;

namespace MvcApplication10.Helpers
{
    public class JsonMessage
    {
        private bool _result;
        private string _message;
        private Object _object;
        private string _helpURL;

        public bool Result
        {
            get { return _result; }
            set { _result = value; }
        }

        public string Message
        {
            get { return _message; }
            set { _message = value; }
        }

        public Object Object 
        { 
            get { return _object; } 
            set { _object = value; } 
        }

        public string HelpURL
        {
            get { return _helpURL; }
            set { _helpURL = value; }
        }
    }
}
