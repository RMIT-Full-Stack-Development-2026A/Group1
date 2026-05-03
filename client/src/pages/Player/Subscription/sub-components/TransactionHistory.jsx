// TransactionHistory.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function TransactionHistory({ transactions }) {
    return (
        <section className="bg-[#0d0d1a] border border-[#3d484d] overflow-hidden">
            <div className="bg-[#1e1e2c] px-6 py-3 border-b border-[#3d484d]">
                <h2 className="font-headline text-[10px] text-[#e3e0f4]">TRANSACTION_LOG.DAT</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                        <tr className="bg-[#292937] border-b border-[#3d484d]">
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">TIMESTAMP (UTC)</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">CREDIT / DEBIT</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">TYPE</th>
                            <th className="px-6 py-4 text-[#879398] font-headline text-[9px]">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d484d]">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#1e1e2c] transition-colors">
                                <td className="px-6 py-4">{tx.date}</td>
                                <td className={`px-6 py-4 ${tx.isDebit ? 'text-[#ffb4ab]' : 'text-[#fba866]'}`}>{tx.amount}</td>
                                <td className="px-6 py-4">{tx.type}</td>
                                <td className="px-6 py-4 text-[#93e2ff] font-bold">{tx.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-3 border-t border-[#3d484d] bg-[#292937] text-right">
                <span className="font-mono text-[9px] text-[#879398]">END OF DATA STREAM</span>
            </div>
        </section>
    );
}

TransactionHistory.propTypes = {
    transactions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            amount: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            isDebit: PropTypes.bool.isRequired
        })
    ).isRequired
};