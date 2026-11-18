"use client";

import React from "react";
import * as Primitive from "@radix-ui/react-accordion";

export const AccordionRoot = Primitive.Root;
export const AccordionItem = Primitive.Item;
export const AccordionTrigger = Primitive.Trigger;
export const AccordionContent = Primitive.Content;

export function useAccordionContext() {
  // no-op shim so components calling this outside an Accordion.Root don't crash
  return {
    openItems: [] as string[],
    setOpenItems: () => {},
  };
}

// Common aliases used across the codebase.
export const Accordion = AccordionRoot;
export const AccordionItemComponent = AccordionItem;
export const AccordionTriggerComponent = AccordionTrigger;
export const AccordionContentComponent = AccordionContent;

// Named exports for consumers that import from @radix-ui/react-accordion directly
// (AccordionRoot etc. are already exported above; re-export for convenience)
