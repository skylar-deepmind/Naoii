import Link from "next/link";
import { getDict } from "@/lib/i18n";

export async function Footer() {
  const dict = await getDict();

  const linkGroups = [
    {
      title: dict.footer.product,
      links: [
        { label: dict.nav.home, href: "/" },
        { label: dict.nav.features, href: "/#features" },
        { label: dict.footer.docs, href: "/docs" },
        { label: dict.footer.changelog, href: "/changelog" },
      ],
    },
    {
      title: dict.footer.community,
      links: [
        { label: dict.footer.feed, href: "/feed" },
        { label: dict.nav.postNew, href: "/posts/new" },
        { label: dict.footer.library, href: "/library" },
      ],
    },
    {
      title: dict.footer.about,
      links: [
        { label: dict.nav.profile, href: "/app" },
        { label: dict.nav.register, href: "/register" },
        { label: dict.nav.login, href: "/login" },
      ],
    },
  ];

  return (
    <footer className="bg-base-200 text-base-content border-t border-base-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">{dict.common.siteName}</Link>
            <p className="text-xs text-base-content/50 mt-1">{dict.common.tagline}</p>
          </div>
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">{group.title}</p>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-base-content/60 hover:text-base-content transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-base-300 mt-8 pt-6 text-center text-xs text-base-content/40">
          <p>© {new Date().getFullYear()} {dict.common.siteName} — {dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
