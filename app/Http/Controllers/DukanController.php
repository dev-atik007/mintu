<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class DukanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            abort(403, 'Only admins can view this page.');
        }

        $todayStr = \Carbon\Carbon::now()->format('Y-m-d');
        
        $dukans = $user->employees()->with('transactions')->get()->map(function ($dukan) use ($todayStr) {
            $todayTransactions = $dukan->transactions->filter(function ($tx) use ($todayStr) {
                return str_starts_with($tx->date, $todayStr);
            });

            $totalIncome = $todayTransactions->where('type', 'income')->sum('amount');
            $totalExpense = $todayTransactions->where('type', 'expense')->sum('amount');

            return [
                'id' => $dukan->id,
                'name' => $dukan->name,
                'email' => $dukan->email,
                'created_at' => $dukan->created_at->toISOString(),
                'today_income' => $totalIncome,
                'today_expense' => $totalExpense,
                'today_balance' => $totalIncome - $totalExpense,
            ];
        });

        return Inertia::render('Dukans/Index', [
            'dukans' => $dukans,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            abort(403, 'Only admins can register dukans.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'employee',
            'admin_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'Dukan registered successfully!');
    }
}
