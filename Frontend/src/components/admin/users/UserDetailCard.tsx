import React from "react";

interface UserDetailCardProps {
  label: string;
  value: string;
}

export const UserDetailCard: React.FC<UserDetailCardProps> = ({ label, value }) => (
  <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm font-medium capitalize text-foreground">{value}</p>
  </div>
);
