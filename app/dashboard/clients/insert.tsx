"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InsertClient() {
  const [name, setName] = useState("");
  const [capital, setCapital] = useState(0);
  const [debt, setDebt] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculateRisk = () => {
    let score = 0;
    if (capital > 100000) score += 30;
    if (debt < 50000) score += 30;
    if (liquidity > 20000) score += 40;

    let level = "Faible";
    if (score < 50) level = "Élevé";
    else if (score < 80) level = "Moyen";

    return { score, level };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { score, level } = calculateRisk();

    const { data, error } = await supabase
      .from("clients")
      .insert([{ name, capital, debt, liquidity, riskScore: score, riskLevel: level }])
      .select();

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert(`Client ${data[0].name} ajouté avec score ${score} (${level})`);
      setName(""); setCapital(0); setDebt(0); setLiquidity(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Ajouter un client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom du client"
          className="w-full p-2 border rounded"
          value={name} onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Capital"
          className="w-full p-2 border rounded"
          value={capital} onChange={e => setCapital(Number(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Dette"
          className="w-full p-2 border rounded"
          value={debt} onChange={e => setDebt(Number(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Liquidité"
          className="w-full p-2 border rounded"
          value={liquidity} onChange={e => setLiquidity(Number(e.target.value))}
          required
        />
        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={loading}
        >
          {loading ? "Ajout en cours..." : "Ajouter Client"}
        </button>
      </form>
    </div>
  );
}