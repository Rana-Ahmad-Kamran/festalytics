import Link from "next/link";

export default function AdminFooter() {
  return (
    <footer className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
      <p>© {new Date().getFullYear()} Festalytics Global Operations · v2.4.0-stable</p>
      <div className="flex flex-wrap items-center gap-6">
        <Link href="/admin/settings" className="hover:text-rose-400 transition-colors">
          API Docs
        </Link>
        <Link href="/admin/settings" className="hover:text-rose-400 transition-colors">
          System Status
        </Link>
        <Link href="/admin/settings" className="hover:text-rose-400 transition-colors">
          Support Portal
        </Link>
      </div>
    </footer>
  );
}
