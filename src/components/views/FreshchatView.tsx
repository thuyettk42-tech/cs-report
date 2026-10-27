import React, { useState } from 'react';
import { freshchatAccounts, freshchatAgents } from '../../data/mockData';

interface FreshchatViewProps {
  onOpenExport: () => void;
}

export const FreshchatView: React.FC<FreshchatViewProps> = ({ onOpenExport }) => {
  const [agentSearch, setAgentSearch] = useState('');
  const [selectedTeamGroup, setSelectedTeamGroup] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const filteredAccounts = freshchatAccounts.filter((acc) => {
    if (channelFilter === 'ai') return acc.isAi;
    if (channelFilter === 'channel') return !acc.isAi;
    if (channelFilter === 'alert') return acc.isAlert || acc.isWarning;
    return true;
  });

  const filteredAgents = freshchatAgents.filter((agent) => {
    const matchesSearch =
      !agentSearch ||
      agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.code.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.team.toLowerCase().includes(agentSearch.toLowerCase());

    const matchesGroup =
      selectedTeamGroup === 'all' || agent.teamGroup === selectedTeamGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Advanced Filter Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Kênh Vận Hành Livechat &amp; Trợ Lý Ảo
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
                T-1 Khép sổ (22/10/2026)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Báo Cáo Freshchat Livechat &amp; Tự Động Hóa AI
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi tốc độ phản hồi tin nhắn đầu (KPI 4.1), thời gian phản hồi liên tiếp (KPI 4.2), tỷ lệ chuyển line và hiệu suất nhân sự trực ca.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                % KPI Tổng Freshchat
              </span>
              <div className="text-lg font-extrabold font-mono text-emerald-700 leading-tight">
                118.56% <span className="text-xs font-semibold text-emerald-600">(+18.5%)</span>
              </div>
            </div>
            <button
              onClick={onOpenExport}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Từ ngày</span>
            <input
              type="text"
              readOnly
              value="01/10/2026"
              className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Đến ngày</span>
            <input
              type="text"
              readOnly
              value="22/10/2026"
              className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Khung giờ</span>
            <input
              type="text"
              readOnly
              value="07:00 - 22:00"
              className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-slate-800 text-xs focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Loại kênh</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none"
            >
              <option value="all">Tất cả kênh (19)</option>
              <option value="ai">Chỉ 3 Bots AI</option>
              <option value="channel">Chỉ FC01 - FC16</option>
              <option value="alert">Cần chú ý / Cảnh báo</option>
            </select>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Team nhân sự</span>
            <select
              value={selectedTeamGroup}
              onChange={(e) => setSelectedTeamGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none"
            >
              <option value="all">Tất cả các Team</option>
              <option value="team-1">Team FC CTO 1 (HN)</option>
              <option value="team-2">Team FC HN 1</option>
              <option value="team-bpo">Team FC Outsourced</option>
            </select>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">KPI 4.1 (&lt; 1p)</span>
            <select className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none">
              <option>Tất cả (&gt;=75%)</option>
              <option>Đạt chuẩn</option>
              <option>Chưa đạt (&lt;75%)</option>
            </select>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Chuyển Line</span>
            <select className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none">
              <option>Tất cả</option>
              <option>Có chuyển line</option>
              <option>Không chuyển</option>
            </select>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-1">Ca trực</span>
            <select className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-slate-800 text-xs focus:outline-none">
              <option>Tất cả các ca</option>
              <option>Ca sáng (7h-12h)</option>
              <option>Ca chiều (12h-18h)</option>
              <option>Ca tối (18h-22h)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2 Big Overview Stat Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overview Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">equalizer</span>
              Overview - Tổng Quan Sản Lượng Chat (22 ngày MTD)
            </h3>
            <span className="text-xs font-mono text-slate-500">22 ngày MTD</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Tổng chat reply</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">21,724</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">100%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Phiên chat xử lý</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">11,833</span>
              <span className="text-[10px] text-primary font-semibold block">54.4%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">TB phiên / ngày</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">1,034</span>
              <span className="text-[10px] text-slate-400 block">phiên/ngày</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Reply &lt; 1 phút</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">18,647</span>
              <span className="text-[10px] text-emerald-700 font-semibold block">85.84%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Reply time TB</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">51.75s</span>
              <span className="text-[10px] text-slate-400 block">Chuẩn 50s</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-800 block truncate font-bold">KPI 4.1 (&lt;1p)</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">85.84%</span>
              <span className="text-[10px] text-emerald-700 font-semibold block">Target ≥75%</span>
            </div>
          </div>
        </div>

        {/* Reply Time & SLA Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">timer</span>
              Reply Time &amp; Hiệu Suất Phản Hồi Chi Tiết
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Trọng số KPI: 15%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Med first time</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">19s</span>
              <span className="text-[10px] text-emerald-700 font-semibold block">Rất nhanh</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Avg first time</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">93.40s</span>
              <span className="text-[10px] text-slate-400 block">Bao gồm chờ</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-800 block truncate font-bold">AVG Response (4.2)</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">43.29s</span>
              <span className="text-[10px] text-emerald-700 font-semibold block">≤ 50s (-6.7s)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Số chuyển line</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">2,823</span>
              <span className="text-[10px] text-slate-400 block">phiên</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">Tỉ lệ chuyển line</span>
              <span className="text-base font-extrabold text-primary font-mono">23.86%</span>
              <span className="text-[10px] text-primary font-semibold block">Tối ưu AI 76%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block truncate">TL Reply &lt; 1p</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">91.95%</span>
              <span className="text-[10px] text-emerald-700 font-semibold block">Vượt chuẩn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table 1: Bots & Accounts FC01 - FC16 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden space-y-3">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h2 className="text-base font-bold text-slate-900">
                Hiệu Suất 2 KPI Theo Nhóm Trợ Lý AI Bot &amp; Tài Khoản Kênh (FC01 - FC16)
              </h2>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                BẢNG 1
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối soát chỉ số phản hồi của Trợ lý AI và các kênh tiếp nhận phân bổ từ ZOA, Web, POS &amp; KAT
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đạt chuẩn
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Response &gt; 50s
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> First &gt; 60s
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-72">Tài Khoản / Kênh Tiếp Nhận</th>
                <th className="py-2.5 px-3 text-right">Tỉ Lệ Chuyển</th>
                <th className="py-2.5 px-3 text-right">Phiên Chat</th>
                <th className="py-2.5 px-3 text-right">Response Time TB</th>
                <th className="py-2.5 px-3 text-right">First Response</th>
                <th className="py-2.5 px-3 text-right">Đạt KPI 4.1 (&lt; 1p)</th>
                <th className="py-2.5 px-4 text-center">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    acc.isAi ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    {acc.isAi ? (
                      <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">forum</span>
                    )}
                    <span>{acc.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{acc.transferRate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {acc.chats.toLocaleString()}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      acc.isWarning ? 'text-amber-700 bg-amber-50' : 'text-emerald-700'
                    }`}
                  >
                    {acc.responseTime}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      acc.isAlert ? 'text-rose-700 bg-rose-50 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {acc.firstResponseTime}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      acc.isAlert ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {acc.kpi41Rate}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        acc.isAlert
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : acc.isWarning
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Agents Breakdown by Team */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden space-y-3">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-base font-bold text-slate-900">
                Phân Tích Chi Tiết Hiệu Suất 2 KPI Theo Nhân Sự Trực Ca (Phân Theo Team)
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                BẢNG 2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Báo cáo đối soát cá nhân phục vụ tính thưởng phạt KPI hàng tuần/tháng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Tìm nhân sự..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:bg-white w-44"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
            </div>
            <select
              value={selectedTeamGroup}
              onChange={(e) => setSelectedTeamGroup(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả Team</option>
              <option value="team-1">Team FC Inhouse 1 (CTO 1)</option>
              <option value="team-2">Team FC Inhouse 2 (HN 1)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-60">Nhân Sự &amp; Mã NV</th>
                <th className="py-2.5 px-3">Team Phân Công</th>
                <th className="py-2.5 px-3 text-right">Phiên Xử Lý</th>
                <th className="py-2.5 px-3 text-right">Response Time TB</th>
                <th className="py-2.5 px-3 text-right">First Response</th>
                <th className="py-2.5 px-3 text-right">% Đạt KPI (&lt;1p)</th>
                <th className="py-2.5 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    agent.status === 'alert' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    <div>{agent.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{agent.code}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{agent.team}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {agent.chats}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      agent.status === 'alert' ? 'text-rose-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {agent.responseTime}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      agent.status === 'alert' ? 'text-rose-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {agent.firstResponseTime}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      agent.status === 'alert' ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {agent.kpiRate}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        agent.status === 'excellent'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : agent.status === 'good'
                          ? 'bg-sky-50 text-primary border border-sky-200'
                          : agent.status === 'warning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                      }`}
                    >
                      {agent.statusText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
