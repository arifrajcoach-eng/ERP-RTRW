import React from "react";
import { Download } from "lucide-react";

export default function AuditLogView({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
          🛡️ AUDIT LOG & GOVERNANCE
        </h2>
        <button
          onClick={() => {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              ["Timestamp,User,Action,Resource,Details"]
                .concat(
                  logs.map(
                    (log) =>
                      `"${new Date(log.timestamp).toLocaleString("id-ID")}","${log.userName}","${log.action}","${log.resource}","${log.details}"`,
                  ),
                )
                .join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute(
              "download",
              `audit_log_${new Date().toISOString()}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Action</th>
                <th className="px-8 py-6">Resource</th>
                <th className="px-8 py-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString("id-ID")}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                        {log.userName?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">
                        {log.userName}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        log.action.includes("HAPUS")
                          ? "bg-red-50 text-red-600"
                          : log.action.includes("TAMBAH")
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-medium text-slate-500 uppercase text-[10px] tracking-widest">
                    {log.resource}
                  </td>
                  <td className="px-8 py-6 text-slate-500 max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
