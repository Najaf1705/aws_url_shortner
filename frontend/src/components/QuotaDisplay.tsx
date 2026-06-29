import { useAppSelector } from "../store/hooks";

interface QuotaDisplayProps {
  onUpgradeClick?: () => void;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ onUpgradeClick }) => {
  const quota = useAppSelector((state) => state.links.quota);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated || !quota) {
    return null;
  }

  const isQuotaExhausted = quota.freeLinksRemaining === 0;
  const percentageUsed = (quota.freeLinksUsed / quota.freeLinksLimit) * 100;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Free Links Quota
        </h3>
        <span className="text-sm font-semibold text-primary">
          {quota.freeLinksUsed} / {quota.freeLinksLimit}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all duration-300 ${
            isQuotaExhausted
              ? "bg-red-500"
              : percentageUsed > 80
                ? "bg-yellow-500"
                : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        {isQuotaExhausted ? (
          <span className="font-medium text-red-600 dark:text-red-400">
            Quota exhausted! Create extra links for ₹{quota.extraLinkCost} each.
          </span>
        ) : (
          <span>
            {quota.freeLinksRemaining} free link{quota.freeLinksRemaining !== 1 ? "s" : ""} remaining
          </span>
        )}
      </p>

      {isQuotaExhausted && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Upgrade to Premium
        </button>
      )}
    </div>
  );
};
