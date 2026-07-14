import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { logoutAction } from "@/server/actions/auth";
import { getUnreadCount } from "@/server/queries/notifications";
import { getLocale, getDict } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  user?: SessionUser | null;
}

export async function Navbar({ user }: NavbarProps) {
  const isAuthenticated = !!user;
  const locale = await getLocale();
  const dict = await getDict();

  const publicLinks = [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.features, href: "/#features" },
    { label: dict.nav.docs, href: "/docs" },
    { label: dict.nav.changelog, href: "/changelog" },
  ];

  const authenticatedLinks = [
    { label: dict.nav.home, href: "/app" },
    { label: dict.nav.community, href: "/app" },
    { label: dict.nav.library, href: "/library" },
  ];

  const navLinks = isAuthenticated ? authenticatedLinks : publicLinks;

  let unreadCount = 0;
  if (user) {
    unreadCount = await getUnreadCount(user.id);
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50 backdrop-blur-sm bg-base-100/90">
      <div className="navbar-start">
        {/* Mobile menu */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href={isAuthenticated ? "/app" : "/"} className="btn btn-ghost text-xl font-bold tracking-tight px-2">
          {dict.common.siteName}
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              <Link href={link.href} className="text-sm">{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side */}
      <div className="navbar-end gap-1">
        <LanguageSwitcher currentLocale={locale} />

        {isAuthenticated ? (
          <>
            {/* Notification bell */}
            <Link href="/notifications" className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="badge badge-xs badge-primary indicator-item">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User menu */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <UserAvatar username={user.displayName || user.username} size="sm" />
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-48">
                <li className="menu-title"><span>{user.displayName || user.username}</span></li>
                <li><Link href={`/profile/${user.username}`}>{dict.nav.profile}</Link></li>
                <li><Link href="/settings/profile">{dict.nav.settings}</Link></li>
                {user.role === "ADMIN" && <li><Link href="/admin">{dict.nav.admin}</Link></li>}
                <div className="divider my-1" />
                <li>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full text-left">{dict.nav.logout}</button>
                  </form>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link href="/login"><Button variant="ghost" size="sm">{dict.nav.login}</Button></Link>
            <Link href="/register" className="hidden sm:inline-flex"><Button variant="primary" size="sm">{dict.nav.register}</Button></Link>
          </>
        )}
      </div>
    </header>
  );
}
