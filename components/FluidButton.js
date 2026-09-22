"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function FluidButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 overflow-hidden shadow-xs active:scale-[0.98] select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed group";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5",
  };

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 hover:shadow-md border border-blue-600",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300",
    outline:
      "bg-white text-slate-800 hover:bg-slate-100 border border-slate-300",
    whatsapp:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md border border-emerald-600",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 hover:shadow-md border border-rose-600",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      {...props}
    >
      {/* Fluid liquid ripple/shimmer layer */}
      <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
      
      {/* Glowing subtle radial backdrop on hover */}
      <span className="absolute -inset-px rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        ) : null}
        {children}
      </span>
    </button>
  );
}
