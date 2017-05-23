using System;

namespace MvcApplication10.Helpers
{
    public static class StringExtension
    {
        public static bool IsEmpty(this string str)
        {
            return String.IsNullOrWhiteSpace(str);
        }
    } 

}