import React, { useState, useEffect } from 'react';
import { Calculator, Users, Clock, AlertTriangle, PieChart, Save, Plus, Trash2, DollarSign, Info, ListTodo, Settings } from 'lucide-react';

const Welcome = () => {
  // --- State Management ---
  
  // Mode Kalkulasi: 'manual' atau 'features'
  const [calcMode, setCalcMode] = useState('manual');

  // Parameter Fitur (Untuk Mode Features)
  const [featureCounts, setFeatureCounts] = useState({ simple: 5, medium: 3, complex: 2 });
  const [featureEffort, setFeatureEffort] = useState({ simple: 2, medium: 5, complex: 10 }); // hari per fitur
  const [testingRatio, setTestingRatio] = useState(30); // persen dari dev time
  const [stagingTime, setStagingTime] = useState(2); // minggu

  // Parameter Proyek
  const [duration, setDuration] = useState(3); // dalam bulan
  const [riskBuffer, setRiskBuffer] = useState(20); // persen
  const [taxRate, setTaxRate] = useState(11); // PPN persen
  const [includeTax, setIncludeTax] = useState(true);

  // Komposisi Tim (Default Values berdasarkan standar market Indonesia/Remote mid-level)
  const [team, setTeam] = useState([
    { id: 1, role: 'Project Manager', count: 1, monthlyRate: 15000000, category: 'Management' },
    { id: 2, role: 'UI/UX Designer', count: 1, monthlyRate: 12000000, category: 'Design' },
    { id: 3, role: 'Senior Backend Dev', count: 1, monthlyRate: 20000000, category: 'Development' },
    { id: 4, role: 'Frontend Dev', count: 1, monthlyRate: 15000000, category: 'Development' },
    { id: 5, role: 'QA Tester', count: 1, monthlyRate: 10000000, category: 'QA' },
  ]);

  // Biaya Operasional (Server, Tools, dll)
  const [operationalCosts, setOperationalCosts] = useState([
    { id: 1, name: 'Server & Cloud (AWS/GCP)', cost: 2000000, type: 'monthly' },
    { id: 2, name: 'Lisensi Software & Tools', cost: 1500000, type: 'one-time' },
  ]);

  // Hasil Perhitungan
  const [totals, setTotals] = useState({
    manpower: 0,
    operational: 0,
    subtotal: 0,
    bufferAmount: 0,
    taxAmount: 0,
    grandTotal: 0
  });

  // --- Functions ---

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Kalkulasi Durasi Otomatis berdasarkan Fitur
  useEffect(() => {
    if (calcMode === 'features') {
      // 1. Hitung Total Man-Days untuk Development
      const totalDevManDays = 
        (featureCounts.simple * featureEffort.simple) +
        (featureCounts.medium * featureEffort.medium) +
        (featureCounts.complex * featureEffort.complex);

      // 2. Hitung Kapasitas Developer (Jumlah Dev * Hari Kerja per Bulan)
      // Filter role yang kategorinya 'Development'
      const devCount = team
        .filter(t => t.category === 'Development')
        .reduce((acc, t) => acc + t.count, 0) || 1; // Default 1 dev to avoid infinity
      
      const workDaysPerMonth = 20; // Standar hari kerja
      const devMonths = totalDevManDays / (devCount * workDaysPerMonth);

      // 3. Tambahkan Buffer Testing (QA)
      const monthsWithTesting = devMonths * (1 + (testingRatio / 100));

      // 4. Tambahkan Waktu Staging/Deployment (dalam minggu dikonversi ke bulan)
      const monthsWithStaging = monthsWithTesting + (stagingTime / 4);

      // Set Duration (Round up to 1 decimal place)
      setDuration(parseFloat(monthsWithStaging.toFixed(1)));
    }
  }, [calcMode, featureCounts, featureEffort, team, testingRatio, stagingTime]);

  const calculateTotal = () => {
    // 1. Hitung Manpower: (Rate * Jumlah Orang * Durasi Bulan)
    const manpowerCost = team.reduce((acc, member) => {
      return acc + (member.monthlyRate * member.count * duration);
    }, 0);

    // 2. Hitung Operasional
    const opCost = operationalCosts.reduce((acc, item) => {
      if (item.type === 'monthly') {
        return acc + (item.cost * duration);
      }
      return acc + item.cost; // One-time
    }, 0);

    const subtotal = manpowerCost + opCost;
    
    // 3. Hitung Buffer (Risk Contingency)
    const bufferAmount = subtotal * (riskBuffer / 100);
    
    // 4. Hitung Tax
    const taxableAmount = subtotal + bufferAmount;
    const taxAmount = includeTax ? taxableAmount * (taxRate / 100) : 0;

    const grandTotal = taxableAmount + taxAmount;

    setTotals({
      manpower: manpowerCost,
      operational: opCost,
      subtotal,
      bufferAmount,
      taxAmount,
      grandTotal
    });
  };

  useEffect(() => {
    calculateTotal();
  }, [duration, riskBuffer, team, operationalCosts, taxRate, includeTax]);

  // Handlers untuk Tim
  const updateTeamMember = (id, field, value) => {
    const updatedTeam = team.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    );
    setTeam(updatedTeam);
  };

  const addTeamMember = () => {
    const newId = team.length > 0 ? Math.max(...team.map(t => t.id)) + 1 : 1;
    setTeam([...team, { id: newId, role: 'Role Baru', count: 1, monthlyRate: 10000000, category: 'Development' }]);
  };

  const removeTeamMember = (id) => {
    setTeam(team.filter(t => t.id !== id));
  };

  // Handlers untuk Operasional
  const updateOpCost = (id, field, value) => {
    const updatedOps = operationalCosts.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setOperationalCosts(updatedOps);
  };

  const addOpCost = () => {
    const newId = operationalCosts.length > 0 ? Math.max(...operationalCosts.map(o => o.id)) + 1 : 1;
    setOperationalCosts([...operationalCosts, { id: newId, name: 'Biaya Baru', cost: 1000000, type: 'one-time' }]);
  };

  const removeOpCost = (id) => {
    setOperationalCosts(operationalCosts.filter(o => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              Estimator Budget Aplikasi
            </h1>
            <p className="text-gray-500 mt-2">
              Kalkulasi estimasi biaya pengembangan software berdasarkan metode <em>Time & Material</em>.
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-xs text-gray-500 uppercase font-semibold">Total Estimasi</div>
            <div className="text-2xl font-bold text-indigo-600">{formatCurrency(totals.grandTotal)}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Input & Konfigurasi */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Parameter Proyek (Duration Calculation) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-500 w-5 h-5" />
                  <h2 className="text-lg font-bold">1. Durasi Proyek</h2>
                </div>
                {/* Toggle Mode */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-semibold">
                  <button 
                    onClick={() => setCalcMode('manual')}
                    className={`px-3 py-1.5 rounded-md transition ${calcMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Input Manual
                  </button>
                  <button 
                    onClick={() => setCalcMode('features')}
                    className={`px-3 py-1.5 rounded-md transition ${calcMode === 'features' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Estimasi Fitur
                  </button>
                </div>
              </div>

              {calcMode === 'manual' ? (
                // --- MODE MANUAL ---
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Proyek (Bulan)</label>
                  <input 
                    type="number" 
                    min="0.5"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Masukkan total durasi dari Kick-off hingga Go-Live.
                  </p>
                </div>
              ) : (
                // --- MODE ESTIMASI FITUR ---
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                    <div className="flex justify-between items-center text-indigo-900 mb-1">
                      <span className="text-sm font-semibold">Estimasi Durasi:</span>
                      <span className="text-2xl font-bold">{duration} Bulan</span>
                    </div>
                    <div className="text-xs text-indigo-600">
                      *Dihitung otomatis berdasarkan jumlah fitur dibagi jumlah developer, ditambah buffer testing & staging.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fitur Simpel</label>
                      <input 
                        type="number" 
                        min="0"
                        value={featureCounts.simple}
                        onChange={(e) => setFeatureCounts({...featureCounts, simple: parseInt(e.target.value) || 0})}
                        className="w-full p-2 border border-gray-300 rounded text-center" 
                      />
                      <span className="text-[10px] text-gray-400 block text-center mt-1">Est: {featureEffort.simple} hari/fitur</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fitur Sedang</label>
                      <input 
                        type="number" 
                        min="0"
                        value={featureCounts.medium}
                        onChange={(e) => setFeatureCounts({...featureCounts, medium: parseInt(e.target.value) || 0})}
                        className="w-full p-2 border border-gray-300 rounded text-center" 
                      />
                      <span className="text-[10px] text-gray-400 block text-center mt-1">Est: {featureEffort.medium} hari/fitur</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fitur Kompleks</label>
                      <input 
                        type="number" 
                        min="0"
                        value={featureCounts.complex}
                        onChange={(e) => setFeatureCounts({...featureCounts, complex: parseInt(e.target.value) || 0})}
                        className="w-full p-2 border border-gray-300 rounded text-center" 
                      />
                      <span className="text-[10px] text-gray-400 block text-center mt-1">Est: {featureEffort.complex} hari/fitur</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Ratio Testing/QA (%)</label>
                       <div className="flex items-center gap-2">
                         <input 
                           type="range" min="10" max="50" step="5"
                           value={testingRatio}
                           onChange={(e) => setTestingRatio(parseInt(e.target.value))}
                           className="flex-grow h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <span className="text-xs font-bold w-8">{testingRatio}%</span>
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Staging & Deploy (Minggu)</label>
                       <input 
                          type="number" min="0" 
                          value={stagingTime}
                          onChange={(e) => setStagingTime(parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-gray-300 rounded text-sm"
                       />
                     </div>
                  </div>
                </div>
              )}
              
              {/* Risk Buffer slider (Always visible) */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Risk Buffer / Contingency (%)
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10">
                        Best practice: 20-30% untuk mengcover bug tak terduga, perubahan fitur, atau keterlambatan.
                      </div>
                    </div>
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={riskBuffer}
                    onChange={(e) => setRiskBuffer(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm font-semibold text-indigo-600 min-w-[3rem] text-right">{riskBuffer}%</div>
                </div>
              </div>
            </section>

            {/* 2. Komposisi Tim (Manpower) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-indigo-500 w-5 h-5" />
                  <h2 className="text-lg font-bold">2. Komposisi Tim (Manpower)</h2>
                </div>
                <button onClick={addTeamMember} className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                  <Plus className="w-4 h-4" /> Tambah Role
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3 w-16">Jml</th>
                      <th className="px-3 py-3">Kategori</th>
                      <th className="px-3 py-3">Gaji/Rate (Bln)</th>
                      <th className="px-3 py-3 text-right">Subtotal</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member) => (
                      <tr key={member.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input 
                            type="text" 
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 font-medium text-gray-800"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" 
                            min="0"
                            value={member.count}
                            onChange={(e) => updateTeamMember(member.id, 'count', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-gray-200 rounded p-1 text-center"
                          />
                        </td>
                         <td className="px-3 py-2">
                          <select 
                            value={member.category}
                            onChange={(e) => updateTeamMember(member.id, 'category', e.target.value)}
                            className="bg-transparent border-none text-xs text-gray-500 focus:ring-0 cursor-pointer"
                          >
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Management">Management</option>
                            <option value="QA">QA</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-gray-400">Rp</span>
                            <input 
                              type="number" 
                              value={member.monthlyRate}
                              onChange={(e) => updateTeamMember(member.id, 'monthlyRate', parseInt(e.target.value) || 0)}
                              className="w-full pl-8 pr-2 py-1 bg-white border border-gray-200 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-600">
                          {formatCurrency(member.monthlyRate * member.count * duration)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => removeTeamMember(member.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {calcMode === 'features' && (
                <div className="mt-3 bg-blue-50 text-blue-800 p-2 rounded text-xs flex items-center gap-2">
                   <Info className="w-4 h-4" />
                   Perhitungan durasi otomatis hanya memperhitungkan jumlah orang di kategori <strong>"Development"</strong> sebagai pengerja fitur.
                </div>
              )}
            </section>

            {/* 3. Biaya Operasional */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-indigo-500 w-5 h-5" />
                  <h2 className="text-lg font-bold">3. Infrastruktur & Tools</h2>
                </div>
                <button onClick={addOpCost} className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                  <Plus className="w-4 h-4" /> Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                {operationalCosts.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-center bg-gray-50 p-3 rounded-lg">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateOpCost(item.id, 'name', e.target.value)}
                      className="flex-grow bg-white border border-gray-200 rounded p-2 text-sm"
                      placeholder="Nama Item (misal: Server)"
                    />
                    <select 
                      value={item.type}
                      onChange={(e) => updateOpCost(item.id, 'type', e.target.value)}
                      className="bg-white border border-gray-200 rounded p-2 text-sm w-32"
                    >
                      <option value="monthly">Bulanan</option>
                      <option value="one-time">Sekali Bayar</option>
                    </select>
                    <div className="relative w-40">
                      <span className="absolute left-2 top-2 text-gray-400 text-xs">Rp</span>
                      <input 
                        type="number" 
                        value={item.cost}
                        onChange={(e) => updateOpCost(item.id, 'cost', parseInt(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-2 bg-white border border-gray-200 rounded text-sm text-right"
                      />
                    </div>
                    <button onClick={() => removeOpCost(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Kolom Kanan: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Breakdown Biaya
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-700">
                  <span className="text-indigo-200">Durasi</span>
                  <span className="font-semibold text-white">{duration} Bulan</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-indigo-700">
                  <span className="text-indigo-200">Biaya SDM (Manpower)</span>
                  <span className="font-semibold">{formatCurrency(totals.manpower)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b border-indigo-700">
                  <span className="text-indigo-200">Infrastruktur & Tools</span>
                  <span className="font-semibold">{formatCurrency(totals.operational)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-indigo-700">
                  <span className="text-indigo-200 flex items-center gap-1">
                    Risk Buffer ({riskBuffer}%)
                  </span>
                  <span className="font-semibold text-yellow-300">{formatCurrency(totals.bufferAmount)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-200">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal + totals.bufferAmount)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeTax}
                        onChange={() => setIncludeTax(!includeTax)}
                        className="rounded text-indigo-500 focus:ring-0" 
                      />
                      <span className="text-indigo-200">Termasuk PPN ({taxRate}%)</span>
                    </label>
                    <span className={`font-semibold ${includeTax ? 'text-white' : 'text-gray-500'}`}>
                      {formatCurrency(totals.taxAmount)}
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-800 p-4 rounded-lg mt-4 border border-indigo-600">
                  <span className="block text-xs text-indigo-300 uppercase mb-1">Total Estimasi Budget</span>
                  <span className="block text-3xl font-bold text-white tracking-tight">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>

                <div className="mt-6 text-xs text-indigo-300 leading-relaxed">
                  <p className="mb-2"><strong>Tips Best Practice:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Buffer 20% melindungi Anda dari "Scope Creep".</li>
                    <li>Rasio Testing 30% dari waktu develop adalah standar aman.</li>
                    <li>Waktu Staging termasuk UAT (User Acceptance Test) klien.</li>
                  </ul>
                </div>

                <button 
                  onClick={() => {
                      const text = `Estimasi Budget Aplikasi\nDurasi: ${duration} Bulan\nTotal: ${formatCurrency(totals.grandTotal)}`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                        alert("Ringkasan disalin ke clipboard!");
                      } else {
                        // Fallback
                        const textArea = document.createElement("textarea");
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                         alert("Ringkasan disalin ke clipboard!");
                      }
                  }}
                  className="w-full mt-4 bg-white text-indigo-900 py-3 rounded-lg font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salin Ringkasan
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;