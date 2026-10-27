import React, { useState } from 'react';
import { getInitialMultiChannelData } from '../../services/googleSheetsSync';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  defaultFilename?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  defaultFilename = 'Bao_Cao_CSKH_KiotViet_T10_2026',
}) => {
  const [format, setFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setProgress(30);

    setTimeout(() => {
      try {
        if (format === 'pdf') {
          setProgress(100);
          setTimeout(() => {
            setIsExporting(false);
            setProgress(0);
            onClose();
            window.print();
          }, 300);
          return;
        }

        const metrics = getInitialMultiChannelData();
        const BOM = '\uFEFF';
        const csvRows = ['Kênh,Chỉ số,Tháng 1,Tháng 2,Tháng 3,Tháng 4,Tháng 5,Tháng 6,Tháng 7,Tháng 8,Tháng 9,Tháng 10,Tháng 11,Tháng 12,Định nghĩa / Ghi chú'];
        
        metrics.forEach((row) => {
          const cells = [
            `"${row.channel}"`,
            `"${row.metric}"`,
            ...row.months.map((m) => (m !== null && m !== undefined ? `"${m}"` : '""')),
            `"${row.definition || ''}"`,
          ];
          csvRows.push(cells.join(','));
        });

        const fullContent = BOM + csvRows.join('\r\n');
        const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${defaultFilename}_${format === 'excel' ? 'XLSX' : 'CSV'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setProgress(100);
      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        setTimeout(() => {
          setIsExporting(false);
          setProgress(0);
          onClose();
        }, 500);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">ios_share</span>
            <h3 className="font-bold text-slate-900 text-sm">Xuất Báo Cáo Dữ Liệu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium block mb-1">Báo cáo đang xem:</span>
            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 font-bold text-slate-800 text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
              <span className="truncate">{reportTitle}</span>
            </div>
          </div>

          {/* Format selection */}
          <div>
            <span className="text-slate-700 font-semibold block mb-2">Định dạng xuất tệp</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  format === 'excel'
                    ? 'border-primary bg-sky-50/70 text-primary ring-1 ring-primary font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] block mb-1 text-emerald-600">table_view</span>
                <span>Microsoft Excel</span>
                <span className="block text-[10px] text-slate-400 font-mono font-normal">.xlsx</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  format === 'pdf'
                    ? 'border-primary bg-sky-50/70 text-primary ring-1 ring-primary font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] block mb-1 text-rose-600">picture_as_pdf</span>
                <span>Adobe PDF</span>
                <span className="block text-[10px] text-slate-400 font-mono font-normal">.pdf</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  format === 'csv'
                    ? 'border-primary bg-sky-50/70 text-primary ring-1 ring-primary font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] block mb-1 text-blue-600">dataset</span>
                <span>Chuẩn CSV</span>
                <span className="block text-[10px] text-slate-400 font-mono font-normal">.csv</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-semibold block">Tùy chọn bổ sung</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Bao gồm bảng tổng hợp KPI &amp; biểu đồ tóm tắt</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Kèm bảng dữ liệu chi tiết từng nhân sự / ca trực</span>
            </label>
          </div>

          {/* Progress Indicator */}
          {isExporting && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                <span>Đang trích xuất dữ liệu...</span>
                <span className="font-mono text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-400 font-mono">
            {defaultFilename}.{format === 'excel' ? 'xlsx' : format}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white font-bold transition-colors text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>{isExporting ? 'Đang xuất...' : 'Tải xuống tệp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
