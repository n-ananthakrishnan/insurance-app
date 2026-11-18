"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslationsClient } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { X } from "@/components/ui/icons";
import { useEffect, useRef } from "react";

export function AccidentReportModal() {
  const t = useTranslationsClient("accident");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = () => {
    setIsOpen(false);
    // Return focus to the trigger button
    (document.querySelector("[data-accident-trigger]") as HTMLButtonElement | null)?.focus();
  };

  // Handle Escape and outside click
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        close();
      }
    };

    dialog.addEventListener("keydown", handleKey);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("keydown", handleKey);
      dialog.removeEventListener("click", handleClick);
    };
  }, []);

  const handleStartClaim = () => {
    close();
    router.push("/claims/new");
  };

  if (!mounted) {
    // Prevent hydration mismatch: render nothing until client mounts
    return null;
  }

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition"
        style={{ bottom: "calc(2rem + 14px)", right: "calc(1rem + 14px)" }}
        onClick={() => setIsOpen(true)}
        data-accident-trigger
        aria-label={t("button")}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        open={isOpen}
        className="paper-dialog bg-white sm:my-8 sm:max-w-lg sm:w-full shadow-xl sm:rounded-lg"
        onClose={close}
        aria-labelledby="accident-dialog-title"
        aria-describedby="accident-dialog-desc"
      >
        <div className="p-6 sm:p-8">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={close}
              className="p-1 rounded-md text-muted-400 hover:text-muted-600 hover:bg-navy-100 transition"
              aria-label={t("close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {/* Emergency banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-6">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.335-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.645-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold">{t("emergency")}</p>
              </div>
            </div>

            {/* Main content */}
            <h2 id="accident-dialog-title" className="text-xl font-bold text-navy-900 mb-1">
              {t("modalTitle")}
            </h2>
            <p id="accident-dialog-desc" className="text-muted-600 mb-6">
              {t("modalSubtitle")}
            </p>

            {/* Call button */}
            <a
              href="tel:0120000000"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.468 4.372a1 1 0 01-.532 1.21l-2.832 1.14a11.042 11.042 0 005.516 5.516l1.14-2.832a1 1 0 011.21-.532l4.372 1.468A1 1 0 0121 12v3a2 2 0 01-2 2h-1.28a2 2 0 01-1.414-.586l-1.414-1.414A2 2 0 0015.586 3H8.414a2 2 0 00-1.414.586L6 5.414V9a2 2 0 01-2 2H3z" />
              </svg>
              {t("callUs")}
            </a>

            {/* Divider */}
            <div className="border-t border-navy-200 my-4" />

            {/* Claims button */}
            <p className="text-sm text-muted-600 text-center sm:text-left mb-4">
              緊急でない場合は、こちらから請求を開始できます。
            </p>
            <Button
              onClick={handleStartClaim}
              variant="primary"
              className="w-full sm:w-auto px-6"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {t("startClaim")}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
