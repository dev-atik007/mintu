<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Inertia\Inertia;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $todayStr = Carbon::today()->toDateString();
        $startOfMonthStr = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonthStr = Carbon::now()->endOfMonth()->toDateString();

        // Retrieve transactions
        $transactions = Transaction::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate Stats
        $todayIncome = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->where('date', $todayStr)
            ->sum('amount');

        $todayExpense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->where('date', $todayStr)
            ->sum('amount');

        $monthlyIncome = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('date', [$startOfMonthStr, $endOfMonthStr])
            ->sum('amount');

        $monthlyExpense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startOfMonthStr, $endOfMonthStr])
            ->sum('amount');

        $netBenefit = $monthlyIncome - $monthlyExpense;

        return Inertia::render('Dashboard', [
            'transactions' => $transactions,
            'stats' => [
                'todayIncome' => (double) $todayIncome,
                'todayExpense' => (double) $todayExpense,
                'monthlyIncome' => (double) $monthlyIncome,
                'monthlyExpense' => (double) $monthlyExpense,
                'netBenefit' => (double) $netBenefit,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $request->user()->transactions()->create($validated);

        return redirect()->back()->with('success', 'Logged successfully!');
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);

        return redirect()->back()->with('success', 'Updated successfully!');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Deleted successfully!');
    }
}
