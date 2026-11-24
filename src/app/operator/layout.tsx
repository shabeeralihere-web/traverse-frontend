
import type { ReactNode } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function OperatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout role="operator">
      {children}
    </DashboardLayout>
  );
}
