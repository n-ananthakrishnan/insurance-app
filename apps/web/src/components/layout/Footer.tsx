"use client";

import { House } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-navy-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-navy-700 dark:text-navy-300">
            <House className="w-5 h-5" />
            <span className="font-semibold">Sample Insurance Japan</span>
          </div>
          <p className="text-sm text-muted-600">
            &copy; {new Date().getFullYear()} Sample Insurance Japan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
