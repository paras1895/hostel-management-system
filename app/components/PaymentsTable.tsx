"use client";

import ThemeWatcher from "./ThemeWatcher";

interface Payment {
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

interface Props {
  payments: Payment[];
}

export default function PaymentsTable({ payments }: Props) {
  const { theme, isDark } = ThemeWatcher();

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="text-left">
          <th className="pb-2">Amount</th>
          <th className="pb-2">Status</th>
          <th className="pb-2">Due Date</th>
          <th className="pb-2">Paid Date</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, idx) => (
          <tr key={idx} className="border-t">
            <td className="py-2">₹{payment.amount}</td>
            <td className="py-2">{payment.status}</td>
            <td className="py-2">{payment.dueDate}</td>
            <td className="py-2">{payment.paidDate || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
