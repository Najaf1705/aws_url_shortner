import { useState } from "react";
import type { QuotaInfo } from "../store/slices/links/linksSlice";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota?: QuotaInfo;
  paymentId?: string;
  onConfirm?: (paymentId?: string) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  quota,
  paymentId,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const loadRazorpayScript = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Browser window is unavailable"));
        return;
      }

      if (window.Razorpay) {
        resolve();
        return;
      }

      const existing = document.getElementById("razorpay-checkout-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3000";
      const amount = Math.max(100, Math.round((Number(quota?.extraLinkCost ?? 1) || 1) * 100));

      const createOrderResponse = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `shorty-${Date.now()}`,
        }),
      });

      const createOrderData = await createOrderResponse.json();
      if (!createOrderResponse.ok) {
        throw new Error(createOrderData?.message || "Failed to create Razorpay order");
      }

      if (!createOrderData.checkout_url) {
        throw new Error("Razorpay checkout URL is not available");
      }

      window.location.assign(createOrderData.checkout_url);
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upgrade Your Links
            </h2>
          </div>

          <div className="px-6 py-4">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              You've reached your free link quota of{" "}
              <span className="font-semibold">{quota?.freeLinksLimit} links</span>.
            </p>

            <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Extra Link
                </span>
                <span className="text-lg font-semibold text-primary">
                  ₹{quota?.extraLinkCost}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Create additional links beyond your free quota
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 You'll be charged only for extra links beyond your quota. First{" "}
                <strong>{quota?.freeLinksLimit} links are always free</strong>.
              </p>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                For the Razorpay test account, UPI and domestic cards/netbanking are the most reliable options. International cards are not supported in this sandbox mode.
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
