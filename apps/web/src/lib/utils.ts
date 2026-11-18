import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ifFirst(prefix: string, children: string) {
  const parts = children.split(",").map((c) => c.trim());
  if (parts.length > 1) {
    return `${prefix}${parts.join(",")}`;
  }
  return children;
}

export function storedSelector(prefix?: string) {
  const selector = arguments[1] as string;
  if (prefix) {
    return `${prefix} ${selector}`;
  }
  return selector;
}

export function scrollIntoViewOnClick(node: HTMLElement, options?: ScrollIntoViewOptions) {
  node.addEventListener("click", () => {
    node.scrollIntoView(options ?? { behavior: "smooth" });
  });
}

export function insetPoint(rect: DOMRect, options?: { threshold?: number }) {
  const threshold = options?.threshold ?? 50;
  return rect.width > threshold && rect.height > threshold;
}

export function makeFocusVisible() {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue("--focus-color").trim() || "transparent";
}

export { cn as cnVar };
