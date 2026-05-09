import React from "react";

export default function PlayerManagementHeader() {
	return (
		<section className="border-l-4 border-primary-container py-2 pl-6">
			<p className="mb-2 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.35em] text-primary/80">
				Administrative Access // Player Registry
			</p>
			<h1 className="font-headline text-2xl text-primary drop-shadow-[0_0_10px_#4cc9f0] md:text-3xl">
				PLAYER MANAGEMENT TERMINAL
			</h1>
		</section>
	);
}
