"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(100.0); // Fake initial balance for UI
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");

  // Design Colors:
  // Background: bg-slate-50 (White/Blueish)
  // Cards: bg-white
  // Primary: text-blue-900
  // Buttons: bg-rose-500

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      // router.push("/login"); // Uncomment later
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ receiverEmail: receiver, amount })
    });

    const data = await res.json();
    if (data.success) {
      setMessage("💸 Transfer Successful!");
      setBalance(balance - Number(amount)); // Optimistic update
    } else {
      setMessage("❌ Error: " + data.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10">
      
      {/* Header / Navbar */}
      <div className="w-full max-w-4xl flex justify-between items-center px-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
          Secure<span className="text-rose-500">Bank</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-800 font-medium">
            Hello, {user?.username || "Client"}
          </span>
          <button 
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="text-sm text-slate-500 hover:text-rose-500 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
        
        {/* CARD 1: BALANCE (The "Blue" Card) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Current Account</p>
          <h2 className="text-5xl font-bold mt-4 mb-2">{balance.toFixed(2)} €</h2>
          <p className="text-blue-200 text-sm">IBAN: FR76 .... .... ....</p>
          
          <div className="mt-8 flex gap-3">
             <button className="flex-1 bg-white/20 hover:bg-white/30 transition py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
               Statement
             </button>
             <button className="flex-1 bg-rose-500 hover:bg-rose-600 transition py-2 rounded-lg text-sm font-semibold shadow-lg shadow-rose-900/20">
               + Add
             </button>
          </div>
        </div>

        {/* CARD 2: TRANSFER FORM (The "White" Card) */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <h3 className="text-xl font-bold text-blue-900 mb-6">New Transfer</h3>
          
          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Recipient (Email)</label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition"
                placeholder="ami@test.com"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount (€)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-4 top-3 text-slate-400 font-bold">€</span>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Send Funds
            </button>
          </form>
        </div>

      </div>

      {/* RECENT TRANSACTIONS LIST */}
      <div className="w-full max-w-4xl px-6 mt-8">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Recent History</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {[1,2,3].map((i) => (
                <div key={i} className="flex justify-between items-center p-5 border-b border-slate-50 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                           OUT
                        </div>
                        <div>
                            <p className="font-bold text-blue-900">Outgoing Transfer</p>
                            <p className="text-xs text-slate-400">2 days ago</p>
                        </div>
                    </div>
                    <span className="font-bold text-rose-500">- 24.00 €</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}