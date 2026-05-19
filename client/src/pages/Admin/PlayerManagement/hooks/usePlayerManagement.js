import { useCallback, useEffect, useState } from "react";
import { playerManagementService } from "../services/playerManagement.service";

const PAGE_SIZE = 10;

const mapPlayerRow = (player) => {
	const isActive = !!player.isActive;
	const isPremium = !!player.isPremium;

	return {
		id: player.id,
		name: player.username || "Unknown",
		email: player.email || "-",
		avatar: player.avatar || "",
		status: isActive ? "ACTIVE" : "INACTIVE",
		statusBorder: isActive ? "border-primary" : "border-error",
		statusBg: isActive ? "bg-primary/10" : "bg-error/10",
		statusText: isActive ? "text-primary" : "text-error",
		statusStyle: isActive
			? { backgroundColor: "rgba(147, 226, 255, 0.14)", color: "#93e2ff", borderColor: "#93e2ff" }
			: { backgroundColor: "rgba(255, 180, 171, 0.14)", color: "#ffb4ab", borderColor: "#ffb4ab" },
		rankIcon: isPremium ? "workspace_premium" : null,
		rankIconClass: isPremium ? "text-[#ffd60a]" : "text-outline/40",
		avatarClass: isPremium ? "border-primary brightness-125" : "border-outline-variant",
		nameClass: isActive ? "text-primary" : "text-on-surface-variant",
		actionLabel: isActive ? "Deactivate" : "Activate",
		actionClass: isActive
			? "bg-error text-on-error border border-error hover:opacity-90"
			: "bg-primary text-on-primary border border-primary hover:opacity-90",
		actionStyle: isActive
			? { backgroundColor: "#ffb4ab", color: "#690005", borderColor: "#ffb4ab" }
			: { backgroundColor: "#93e2ff", color: "#003543", borderColor: "#93e2ff" },
		rowClass: isActive ? "bg-surface hover:bg-surface-container-low" : "bg-surface-container-low/50 hover:bg-surface-container-low",
	};
};

export const usePlayerManagement = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
	const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const [players, setPlayers] = useState([]);
	const [totalPlayers, setTotalPlayers] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [actionLoadingId, setActionLoadingId] = useState(null);

	const statusFilterOptions = playerManagementService.getStatusFilterOptions();

	const buildQuery = useCallback(
		(pageToLoad = page) => {
			const query = {
				page: pageToLoad,
				limit: PAGE_SIZE,
				sortBy: "createdAt",
				sortOrder: "desc",
			};

			const normalizedSearch = appliedSearchTerm.trim();
			if (normalizedSearch.length > 0) {
				query.q = normalizedSearch;
			}

			if (appliedStatusFilter === "active") {
				query.status = "ACTIVE";
			} else if (appliedStatusFilter === "inactive") {
				query.status = "INACTIVE";
			} else if (appliedStatusFilter === "premium") {
				query.premium = true;
			}

			return query;
		},
		[appliedSearchTerm, appliedStatusFilter, page]
	);

	const fetchPlayers = useCallback(
		async (pageToLoad = page) => {
			try {
				setLoading(true);
				const response = await playerManagementService.getPlayers(buildQuery(pageToLoad));
				const payload = response?.data || response || {};
				const items = Array.isArray(payload.items) ? payload.items : [];

				setPlayers(items.map(mapPlayerRow));
				setTotalPlayers(payload.total ?? 0);
				setPage(payload.page ?? pageToLoad);
				setError(null);
			} catch (err) {
				setError(err.message || "Failed to fetch players.");
				setPlayers([]);
				setTotalPlayers(0);
			} finally {
				setLoading(false);
			}
		},
		[buildQuery, page]
	);

	useEffect(() => {
		fetchPlayers(page);
	}, [fetchPlayers, page, appliedSearchTerm, appliedStatusFilter]);

	const executeSearch = () => {
		setAppliedSearchTerm(searchTerm);
		setAppliedStatusFilter(statusFilter);
		setPage(1);
	};

	const resetFilters = () => {
		setSearchTerm("");
		setStatusFilter("");
		setAppliedSearchTerm("");
		setAppliedStatusFilter("");
		setPage(1);
	};

	const goToPage = (nextPage) => {
		setPage(nextPage);
	};

	const togglePlayerStatus = async (player) => {
		try {
			setActionLoadingId(player.id);
			if (player.status === "ACTIVE") {
				await playerManagementService.deactivatePlayer(player.id);
			} else {
				await playerManagementService.reactivatePlayer(player.id);
			}

			await fetchPlayers(page);
		} catch (err) {
			setError(err.message || "Failed to update player status.");
		} finally {
			setActionLoadingId(null);
		}
	};

	return {
		players,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		statusFilterOptions,
		totalPlayers,
		page,
		pageSize: PAGE_SIZE,
		loading,
		error,
		executeSearch,
		resetFilters,
		goToPage,
		togglePlayerStatus,
		actionLoadingId,
		fromIndex: totalPlayers === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
		toIndex: Math.min(page * PAGE_SIZE, totalPlayers),
	};
};
