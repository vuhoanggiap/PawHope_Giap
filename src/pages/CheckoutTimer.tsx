import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";

interface CheckoutTimerProps { createdAtString: string; onTimeout: () => void }

export function CheckoutTimer({ createdAtString, onTimeout }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(240); 
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const createdTime = new Date(createdAtString).getTime();
    const expireTime = createdTime + 4 * 60 * 1000; 

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, Math.floor((expireTime - now) / 1000));
      
      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        onTimeout();
        return false;
      }
      
      setTimeLeft(difference);
      return true;
    };
    calculateTime();

    const timer = setInterval(() => {
      const shouldContinue = calculateTime();
      if (!shouldContinue) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAtString, onTimeout]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  if (isExpired) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 font-semibold text-sm">
        <AlertCircle size={18} />
        The payment period for the order has expired. The payment for your order will be cancelled.
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-between font-medium text-sm">
      <div className="flex items-center gap-2">
        <Clock size={18} className="animate-pulse text-amber-600" />
        <span>The system is holding the items in your cart:</span>
      </div>
      <span className="font-mono text-base font-bold bg-white px-3 py-1 rounded-lg border border-amber-300 text-amber-600">
        {minutes}:{seconds}
      </span>
    </div>
  );
}