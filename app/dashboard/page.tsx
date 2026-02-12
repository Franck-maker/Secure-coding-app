// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  amount: number;
  senderId: number;
  receiverId: number;
  createdAt: string;
  sender: { email: string; username: string | null };
  receiver: { email: string; username: string | null };
};

export default function Dashboard() {
  const router = useRouter();
  
  // 1. Initialize state as NULL (Matches what the server sees)
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false); // Track if we are in browser

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");

  // 2. ONLY load data inside useEffect (Runs only in browser)
  useEffect(() => {
    setIsMounted(true); // We are now on the client

    const initDashboard = async () => {
      // Get User from LocalStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Get Real History & Balance from API
      try {
        const res = await fetch("/api/transactions");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
          if (data.balance !== undefined) setBalance(data.balance);
        }
      } catch (e) {
        console.error("Failed to load history");
      }
    };

    initDashboard();
  }, [router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverEmail: receiver, amount })
    });

    const data = await res.json();
    if (data.success) {
      setMessage("✅ " + data.message);
      setBalance((prev) => prev - Number(amount)); 
      setAmount("");
      setTimeout(() => window.location.reload(), 1000); 
    } else {
      setMessage("❌ Error: " + data.message);
    }
  };

  // 3. Prevent rendering until mounted to avoid Hydration Error
  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10">
      
      {/* Navbar */}
      <div className="w-full max-w-4xl flex justify-between items-center px-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
          Secure<span className="text-rose-500">Bank</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-800 font-medium">
             Hello, {user?.username || user?.email}
          </span>
          <button 
            onClick={() => { 
                localStorage.clear(); 
                // Clear cookie hack
                document.cookie = "token=; Max-Age=0; path=/;"; 
                router.push("/login"); 
            }}
            className="text-sm text-slate-500 hover:text-rose-500 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Current Balance</p>
          <h2 className="text-5xl font-bold mt-4 mb-2">{balance.toFixed(2)} €</h2>
          <p className="text-blue-200 text-sm opacity-80">Secure Account</p>
        </div>

        {/* Transfer Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <h3 className="text-xl font-bold text-blue-900 mb-6">New Transfer</h3>
          
          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Recipient Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-900 outline-none focus:border-rose-500 transition"
                placeholder="friend@test.com"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Amount (€)</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-900 font-bold outline-none focus:border-rose-500 transition"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${message.includes("Error") ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
              Send Money
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="w-full max-w-4xl px-6 mt-8">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Transaction History</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No transactions found.</div>
            ) : (
                transactions.map((tx) => {
                    const isIncoming = tx.receiverId === user?.id;
                    return (
                        <div key={tx.id} className="flex justify-between items-center p-5 border-b border-slate-50 hover:bg-slate-50 transition">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                   {isIncoming ? "IN" : "OUT"}
                                </div>
                                <div>
                                    <p className="font-bold text-blue-900">
                                        {isIncoming ? `Received from ${tx.sender.email}` : `Sent to ${tx.receiver.email}`}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold ${isIncoming ? 'text-green-600' : 'text-rose-500'}`}>
                                {isIncoming ? "+" : "-"} {tx.amount.toFixed(2)} €
                            </span>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}