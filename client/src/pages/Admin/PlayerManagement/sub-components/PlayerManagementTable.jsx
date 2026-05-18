import React from "react";

export default function PlayerManagementTable({ players, onToggleStatus, actionLoadingId, loading = false }) {
	const renderAvatar = (player) => {
		if (player.avatar) {
			return (
				<img
					src={player.avatar}
					alt={`${player.name} avatar`}
					className="h-full w-full object-cover"
					loading="lazy"
					crossOrigin="anonymous"
						onError={(e) => {
						// Replace broken or blocked remote images with a local placeholder
						e.currentTarget.onerror = null;
						e.currentTarget.src = '/images/avatar-placeholder.svg';	
					}}
				/>
			);
		}

		return (
			<div className="flex h-full w-full items-center justify-center bg-slate-900 text-[10px] font-bold tracking-widest text-outline">
				{player.name.slice(0, 2)}
			</div>
		);
	};

	if (loading) {
		return (
			<section className="overflow-hidden border border-outline-variant bg-surface shadow-[4px_4px_0px_0px_#1e1e2c]">
				<div className="px-6 py-12 text-center font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest text-outline">
					Loading players...
				</div>
			</section>
		);
	}

	if (players.length === 0) {
		return (
			<section className="overflow-hidden border border-outline-variant bg-surface shadow-[4px_4px_0px_0px_#1e1e2c]">
				<div className="px-6 py-12 text-center font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest text-outline">
					No players matched the current filters.
				</div>
			</section>
		);
	}

	return (
		<section className="overflow-x-auto border border-outline-variant bg-surface-card shadow-[4px_4px_0px_0px_#1e1e2c]">
			<table className="w-full border-collapse text-left font-['IBM_Plex_Mono'] text-sm">
				<thead>
					<tr className="border-b border-outline-variant bg-surface-container-high">
						<th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">ID</th>
						<th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Player</th>
						<th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-outline">Email Node</th>
						<th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-outline">Rank</th>
						<th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-outline">Status</th>
						<th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-outline">Action</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-outline-variant">
					{players.map((player) => (
						<tr key={player.id} className={`group transition-colors ${player.rowClass}`}>
							<td className="px-6 py-4 text-xs text-outline/60">{player.id}</td>
							<td className="px-6 py-4">
								<div className="flex items-center gap-3">
									<div className={`h-10 w-10 overflow-hidden border bg-slate-900 p-1 ${player.avatarClass}`}>
										{renderAvatar(player)}
									</div>
									<span className={`font-semibold tracking-tight ${player.nameClass}`}>{player.name}</span>
								</div>
							</td>
							<td className="px-6 py-4 text-xs text-on-surface-variant">{player.email}</td>
							<td className="px-6 py-4 text-center">
								{player.rankIcon ? (
									<span
										className={`material-symbols-outlined text-lg ${player.rankIconClass}`}
										style={{ fontVariationSettings: '"FILL" 1' }}
										aria-hidden="true"
									>
										{player.rankIcon}
									</span>
								) : (
									<span className="text-outline/40">—</span>
								)}
							</td>
							<td className="px-6 py-4 text-center">
								<span
									className={`inline-block border px-3 py-1 text-[10px] font-bold tracking-widest ${player.statusBorder} ${player.statusBg} ${player.statusText}`}
									style={player.statusStyle}
								>
									{player.status}
								</span>
							</td>
							<td className="px-6 py-4 text-center">
								<button
									type="button"
									onClick={() => onToggleStatus?.(player)}
									disabled={actionLoadingId === player.id}
									className={`inline-flex items-center justify-center border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all active:translate-y-0.5 ${player.actionClass}`}
									style={player.actionStyle}
								>
									{actionLoadingId === player.id ? "Working..." : player.actionLabel}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
