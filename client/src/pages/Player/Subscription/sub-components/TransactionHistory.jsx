import React from 'react';
import PropTypes from 'prop-types';

const STATUS_COLOR = {  
    SUCCESS: '#a8ff78',
    FAILED: '#ffb4ab',
    PENDING: '#fad100',
};

export default function TransactionHistory({ transactions }) {
    return (
        <section className="bg-[#0d0d1a] border border-[#3d484d] overflow-hidden mt-16">
            <div className="bg-[#1e1e2c] px-6 py-3 border-b border-[#3d484d]">
                <h2 className="font-headline text-[10px] text-[#e3e0f4]">TRANSACTION_LOG.DAT</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse table table-hover table-striped table-bordered">
                    <thead>
                        <tr className="bg-[#292937] border-b border-[#3d484d]">
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">TIMESTAMP (UTC)</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">AMOUNT</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">ORDER ID</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d484d]">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-[#879398] font-mono text-[11px] uppercase tracking-widest">
                                    NO TRANSACTIONS FOUND
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.externalTransactionId} className="hover:bg-[#1e1e2c] transition-colors">
                                    <td className="px-6 py-4 text-[#879398]">
                                        {new Date(tx.createdAt).toLocaleString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${tx.type === 'REFUND' ? 'text-[#ffb4ab]' : 'text-[#a8ff78]'}`}>
                                        {tx.type === 'REFUND' ? '-' : '+'}
                                        ${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount} {tx.currency ?? 'USD'}
                                    </td>
                                    <td className="px-6 py-4 text-[#879398] font-mono text-[10px]">
                                        {tx.externalTransactionId ? `${tx.externalTransactionId.slice(0, 16)}...` : '—'}
                                    </td>
                                    <td className="px-6 py-4 font-bold" style={{ color: STATUS_COLOR[tx.status] ?? '#879398' }}>
                                        {tx.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-3 border-t border-[#3d484d] bg-[#292937] text-right">
                <span className="font-mono text-[9px] text-[#879398]">
                    {transactions.length > 0 ? `${transactions.length} RECORD(S) FOUND` : 'END OF DATA STREAM'}
                </span>
            </div>
        </section>
    );
}

TransactionHistory.propTypes = {
    transactions: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            currency: PropTypes.string,
            status: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
            orderId: PropTypes.string,
        })
    ).isRequired
};