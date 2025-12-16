import { useState, useEffect } from 'react';

interface Props {
  totalDue: number;
  defaultMethod?: 'cash' | 'online';
  onSubmit: (amount: number, method: 'cash' | 'online', notes?: string) => Promise<void> | void;
}

export default function CreditPaymentForm({ totalDue, defaultMethod = 'cash', onSubmit }: Props) {
  const [amount, setAmount] = useState<number>(totalDue);
  const [method, setMethod] = useState<'cash' | 'online'>(defaultMethod);
  const [notes, setNotes] = useState<string>('');
  const remaining = Math.max(0, totalDue - (amount || 0));

  useEffect(() => {
    setAmount(totalDue);
  }, [totalDue]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Payment Amount (रू)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
        />
        {amount < totalDue && (
          <p className="text-xs text-orange-600 mt-1">Remaining to apply as Customer Credit: रू {remaining.toFixed(2)}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Payment Method</label>
        <div className="grid grid-cols-2 gap-2">
          {(['cash', 'online'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`py-2 rounded-lg font-semibold capitalize ${method === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              type="button"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          placeholder="e.g., Cash received by frontdesk"
        />
      </div>

      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
        <p className="font-semibold mb-1">✓ Payout summary</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Total due: रू {totalDue.toFixed(2)}</li>
          <li>Collect now ({method}): रू {amount.toFixed(2)}</li>
          {amount < totalDue && <li>Apply remaining to Customer Credit: रू {remaining.toFixed(2)}</li>}
          <li>Mark all orders billed and free the table</li>
        </ul>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onSubmit(amount, method, notes)}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-bold shadow-lg transform hover:scale-105 transition-all"
          type="button"
        >
          Complete Payout
        </button>
      </div>
    </div>
  );
}
