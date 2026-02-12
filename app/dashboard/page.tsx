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
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, incoming, outgoing
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  // Profile State
  const [newEmail, setNewEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

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
        const token = localStorage.getItem("token");
        const res = await fetch("/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
          if (data.balance !== undefined) setBalance(data.balance);
        }

        // Admin: Fetch Users
        if (parsedUser.isAdmin) {
            const resAdmin = await fetch("/api/users", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (resAdmin.ok) {
                setAllUsers(await resAdmin.json());
            }
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
      setMessage("✅ " + data.message);
      setBalance((prev) => prev - Number(amount)); 
      setAmount("");
      setTimeout(() => window.location.reload(), 1000); 
    } else {
      setMessage("❌ Error: " + data.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    const token = localStorage.getItem("token");

    const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
    });
    const data = await res.json();
    if(res.ok) {
        setProfileMessage("✅ Updated");
        // Update local user state
        setUser({...user, email: newEmail});
        localStorage.setItem("user", JSON.stringify({...user, email: newEmail}));
    } else {
        setProfileMessage("❌ " + (data.message || "Failed"));
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

        {/* Profile Update Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <h3 className="text-xl font-bold text-blue-900 mb-6">Profile Settings</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">New Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-900 outline-none focus:border-rose-500 transition"
                placeholder="new@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {profileMessage && (
              <div className={`p-3 rounded-lg text-sm font-medium ${profileMessage.includes("Error") || profileMessage.includes("❌") ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"}`}>
                {profileMessage}
              </div>
            )}
            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
              Update Email
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="w-full max-w-4xl px-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h3 className="text-lg font-bold text-blue-900">Transaction History</h3>
            
            {/* Search & Filters */}
            <div className="flex gap-2 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Search by email..." 
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-500 w-full md:w-48 text-blue-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-500 bg-white text-blue-900"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="incoming">Incoming (+)</option>
                    <option value="outgoing">Outgoing (-)</option>
                </select>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {transactions.filter(tx => {
                // Filter Logic
                const matchesSearch = 
                    tx.sender.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    tx.receiver.email.toLowerCase().includes(searchTerm.toLowerCase());
                
                const isIncoming = tx.receiverId === user?.id;

                if (filterType === 'incoming' && !isIncoming) return false;
                if (filterType === 'outgoing' && isIncoming) return false;

                return matchesSearch;
            }).length === 0 ? (
                <div className="p-8 text-center text-slate-400">No transactions found.</div>
            ) : (
                transactions.filter(tx => {
                     // Same Filter Logic for Mapping (Refactor ideally, but inline for safety)
                    const matchesSearch = 
                        tx.sender.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tx.receiver.email.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const isIncoming = tx.receiverId === user?.id;

                    if (filterType === 'incoming' && !isIncoming) return false;
                    if (filterType === 'outgoing' && isIncoming) return false;

                    return matchesSearch;
                }).map((tx) => {
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

      {/* Admin Panel */}
      {user?.isAdmin && (
        <div className="w-full max-w-4xl px-6 mt-8 mb-10">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Admin Panel - User Management</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm text-blue-900">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold">#{u.id}</td>
                    <td className="px-6 py-4">{u.username || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.isAdmin ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"}`}>
                        {u.isAdmin ? "ADMIN" : "USER"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{u.balance.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}