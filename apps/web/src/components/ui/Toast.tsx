"use client";

import React, { forwardRef } from "react";
import * as Primitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Toast = forwardRef<React.ElementRef<typeof Primitive.Root>, React.ComponentPropsWithoutRef<typeof Primitive.Root>>(
  ({ className, ...props }, ref) => (
    <Primitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-96 select-none flex-col gap-3 overflow-hidden rounded-xl border border-navy-200 bg-white p-4 shadow-lg transition-[transform, opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
        className
      )}
      {...props}
    />
  )
);
Toast.displayName = "Toast";

interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ToastTitle = forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <Primitive.Title
      ref={ref}
      className={cn("text-sm font-semibold text-navy-900", className)}
      {...props}
    />
  )
);
ToastTitle.displayName = "ToastTitle";

interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ToastDescription = forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <Primitive.Description
      ref={ref}
      className={cn("text-sm text-muted-600", className)}
      {...props}
    />
  )
);
ToastDescription.displayName = "ToastDescription";

interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <Primitive.Close
      ref={ref}
      className={cn(
        "absolute right-1 top-1 rounded-md p-1 text-muted-500 opacity-0 transition-opacity hover:bg-navy-100 hover:text-navy-700 focus:outline-none focus:opacity-100 data-[state=open]:bg-red-100 data-[state=open]:text-red-600",
        className
      )}
      {...props}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z" clipRule="evenodd" />
      </svg>
    </Primitive.Close>
  )
);
ToastClose.displayName = "ToastClose";

const ToastProvider = Primitive.Provider;

const ToastViewport = forwardRef<React.ElementRef<typeof Primitive.Viewport>, React.ComponentPropsWithoutRef<typeof Primitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <Primitive.Viewport
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:right-0 sm:top-4 sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport };

// re-export primitives for flexibility
const PrimitiveProvider = Primitive.Provider;
const PrimitiveRoot = Primitive.Root;
const PrimitiveClose = Primitive.Close;
const PrimitiveTitle = Primitive.Title;
const PrimitiveDescription = Primitive.Description;
const PrimitiveViewport = Primitive.Viewport;

export {
  PrimitiveProvider as ToastPrimitiveProvider,
  PrimitiveRoot as ToastPrimitiveRoot,
  PrimitiveClose as ToastPrimitiveClose,
  PrimitiveTitle as ToastPrimitiveTitle,
  PrimitiveDescription as ToastPrimitiveDescription,
  PrimitiveViewport as ToastPrimitiveViewport,
};
