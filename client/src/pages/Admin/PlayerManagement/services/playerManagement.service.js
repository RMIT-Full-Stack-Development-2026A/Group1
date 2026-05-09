import http from "@/utils/httpHelper";

export const playerManagementService = {
	async getPlayers(params = {}) {
		const response = await http.get("/admin/players", params);
		return response.data;
	},

	async deactivatePlayer(playerId, reason) {
		const response = await http.patch(
			`/admin/player/${playerId}/deactivate`,
			reason ? { reason } : {}
		);
		return response.data;
	},

	async reactivatePlayer(playerId) {
		const response = await http.patch(`/admin/player/${playerId}/reactivate`, {});
		return response.data;
	},

	getStatusFilterOptions() {
		return [
			{ value: "", label: "STATUS: ALL SYSTEMS" },
			{ value: "active", label: "STATUS: ACTIVE ONLY" },
			{ value: "inactive", label: "STATUS: INACTIVE ONLY" },
			{ value: "premium", label: "STATUS: PREMIUM ONLY" },
		];
	},
};
