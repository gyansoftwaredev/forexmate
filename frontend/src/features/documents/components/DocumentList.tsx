import React from 'react';
import { Download, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface DocumentListProps {
  documents: any[];
  title: string;
  type: 'invoice' | 'receipt';
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, title, type }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/90 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <span>{title}</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400">Total: {documents.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Document ID</th>
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                  <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-2xs">
                    📄
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">No Invoices Available Yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Tax invoices and transaction receipts are generated automatically once currency orders or remittances are completed.
                  </p>
                </td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-amber-700">
                    {type === 'invoice' ? doc.invoiceNumber : doc.receiptNo}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold">
                    {type === 'invoice' ? doc.order?.orderNumber : doc.invoice?.order?.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-slate-900">
                    ₹{Number(type === 'invoice' ? doc.netAmount : doc.amountPaid).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-slate-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer">
                      <Download className="w-3.5 h-3.5 mr-1.5 text-amber-800" />
                      <span>Download PDF</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
