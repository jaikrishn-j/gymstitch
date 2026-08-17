import { createFileRoute } from "@tanstack/react-router";
import { toast } from "@heroui/react";
import { AdminPaymentsPage } from "../../pages/AdminPaymentsPage";
import type { PaymentData } from "../../components/modals/RecordPaymentModal";

export const Route = createFileRoute("/admin/payments")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleRecordPayment = async (data: PaymentData) => {
    toast.success(`Payment of ₹${data.amount} recorded.`);
  };

  const handlePrintReceipt = () => {
    toast.info("Preparing receipt for printing…");
  };

  return (
    <AdminPaymentsPage
      onRecordPayment={handleRecordPayment}
      onPrintReceipt={handlePrintReceipt}
    />
  );
}