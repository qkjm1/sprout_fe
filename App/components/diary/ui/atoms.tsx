//App/components/diary/ui/atoms.tsx


"use client";
import React from "react";

export const Pill: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 ${className}`}
  >
    {children}
  </span>
);



export const Button: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit";
  }>
> = ({ onClick, className = "", children, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-xl shadow-sm border border-black/10 hover:shadow transition active:translate-y-px disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

export const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl shadow-md p-4 bg-white/80 backdrop-blur border border-black/5 ${className}`}
  >
    {children}
  </div>
);
