import Link from "next/link";
import { Gamepad2, Globe, MessageCircle, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Games", href: "/explore" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Pricing", href: "/pricing" },
    { label: "Tournaments", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-arena-border bg-arena-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient-primary">
                CLUTCH ARENA
              </span>
            </Link>
            <p className="text-sm text-arena-text-muted max-w-xs">
              The ultimate competitive gaming platform. Quick games, global rankings, daily rewards.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-arena-text-muted hover:text-arena-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-arena-text-muted hover:text-arena-primary transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-arena-text-muted hover:text-arena-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-arena-text mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-arena-text-muted hover:text-arena-text transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-arena-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-arena-text-muted">
            &copy; 2024 Clutch Arena. All rights reserved.
          </p>
          <p className="text-xs text-arena-text-muted">
            Made with passion for gamers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
