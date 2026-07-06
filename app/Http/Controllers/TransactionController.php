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
        $user = $request->user();
        $userId = $user->id;

        $employees = [];
        if ($user->role === 'admin') {
            $employees = $user->employees()->get();
            if ($request->has('shop_id')) {
                $shopId = $request->input('shop_id');
                // Ensure the shop belongs to this admin
                if ($employees->contains('id', $shopId)) {
                    $userId = $shopId;
                }
            }
        }
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
            ],
            'employees' => $employees,
            'currentShopId' => $userId,
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
        $user = $request->user();
        if ($transaction->user_id !== $user->id) {
            if ($user->role === 'admin') {
                $isEmployee = $user->employees()->where('id', $transaction->user_id)->exists();
                if (!$isEmployee) {
                    abort(403);
                }
            } else {
                abort(403);
            }
        }

        $validated = $request->validate([
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:100',
            // Date was removed from UI but it is still in validation. Let's make it optional or set default to today.
            'date' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        if (!isset($validated['date'])) {
            $validated['date'] = Carbon::today()->toDateString();
        }

        $transaction->update($validated);

        return redirect()->back()->with('success', 'Updated successfully!');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        if ($transaction->user_id !== $user->id) {
            if ($user->role === 'admin') {
                $isEmployee = $user->employees()->where('id', $transaction->user_id)->exists();
                if (!$isEmployee) {
                    abort(403);
                }
            } else {
                abort(403);
            }
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Deleted successfully!');
    }
}
