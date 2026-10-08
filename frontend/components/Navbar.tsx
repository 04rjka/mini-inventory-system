'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Sales Logs', href: '/sales', icon: ShoppingCart },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/" only matches exactly; other items also match nested routes (e.g. /products/1/edit)
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive(href)
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 relative">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-indigo-600"
        >
          <Package size={22} /> Inventory System
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon size={16} />
              {name}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={linkClass(href)}
            >
              <Icon size={16} />
              {name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}