"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";

const EMERGENCY_CONTACTS = [
  { label: "Claim status", href: "/claims" },
  { label: "Message support", href: "/contact" },
  { label: "Find an office", href: "/contact" },
];

export function FloatingAccidentButton() {
  const t = useTranslations();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);

  const isNearClickable = () => {
    if (!floatRef.current) return false;
    const rect = floatRef.current.getBoundingClientRect();
    const FAB_SIZE = 56;
    const THRESHOLD = 80;

    const isOverlapping =
      rect.bottom >= window.innerHeight - THRESHOLD &&
      rect.left <= window.innerWidth - FAB_SIZE;

    return isOverlapping && window.innerWidth >= 375;
  };

  useEffect(() => {
    const shouldFix = isNearClickable();

    if (shouldFix) {
      const style = getComputedStyle(document.documentElement);
      const prefersReducedMotion = style
        .getPropertyValue("prefers-reduced-motion")
        .includes("reduce");

      if (!prefersReducedMotion) {
        const start = performance.now();
        const DISTANCE = 96;
        const DURATION = 380;
        function animate(now: number) {
          const elapsed = now - start;
          const t2 = Math.min(elapsed / DURATION, 1);
          const ease = 1 - Math.pow(1 - t2, 3);

          const translateY = -DISTANCE * ease;
          const translateX = -16 * ease;

          if (floatRef.current) {
            floatRef.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
            floatRef.current.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            floatRef.current.style.top = "20px";
            floatRef.current.style.left = `${window.innerWidth - 56 - 20}px`;
          }

          if (t2 < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
      } else {
        if (floatRef.current) {
          floatRef.current.style.transform = "translate(-16px, -96px)";
          floatRef.current.style.transition = "transform 0.3s ease";
          floatRef.current.style.top = "20px";
          floatRef.current.style.left = `${window.innerWidth - 56 - 20}px`;
        }
      }
    } else if (floatRef.current) {
      floatRef.current.style.transform = "translate(-16px, 0)";
      floatRef.current.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      floatRef.current.style.top = "20px";
      floatRef.current.style.left = `${window.innerWidth - 56 - 20}px`;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!floatRef.current) return;
      const shouldFix = isNearClickable();
      if (shouldFix) {
        floatRef.current.style.top = "20px";
        floatRef.current.style.left = `${window.innerWidth - 56 - 20}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/claims/new");
    setExpanded(false);
  };

  const handleDismiss = () => {
    setExpanded(false);
  };

  return (
    <div ref={floatRef} className="fixed top-20 right-5 z-40 select-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-navy-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-navy-900">事故サポート</span>
              </div>
              <ButtonGroup className="gap-2">
                {EMERGENCY_CONTACTS.map((contact) => (
                  <Button
                    key={contact.href}
                    onClick={() => {
                      router.push(contact.href);
                      handleDismiss();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {t(contact.label)}
                  </Button>
                ))}
              </ButtonGroup>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="w-full mt-2"
              >
                閉じる
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleReportClick}
        aria-label={t("home.reportAccident")}
        className="relative w-14 h-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center animate-accident-pulse"
        aria-expanded={expanded}
        aria-controls="accident-menu"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z"
            clipRule="evenodd"
          />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
      </button>
    </div>
  );
}
