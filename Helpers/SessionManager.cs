using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;
using System.Web.SessionState;

namespace MvcApplication10.Helpers
{
    public class SessionManager
    {
        private ReaderWriterLockSlim sessionlock = new ReaderWriterLockSlim();
        private HttpSessionState Session;

        public SessionManager(HttpSessionState Session = null)
        {
            this.Session = Session ?? HttpContext.Current.Session;
        }

        public void Set(string key, object value)
        {
            sessionlock.EnterWriteLock();
            try
            {
                if (this.Session != null)
                    this.Session[key] = value;
            }
            finally
            {
                sessionlock.ExitWriteLock();
            }
        }

        public object Get(string key)
        {
            return this.Session != null ? this.Session[key] : null;
        }

        public void Remove(string key)
        {
            sessionlock.EnterUpgradeableReadLock();
            try
            {
                if (this.Session != null)
                    this.Session.Remove(key);
            }
            finally
            {
                sessionlock.ExitUpgradeableReadLock();
            }
        }
    }
}
