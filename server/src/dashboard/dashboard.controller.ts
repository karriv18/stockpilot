import type { Request, Response } from "express"
import * as dashboardService from "./dashboard.service"

export async function getDashboard(_req: Request, res: Response) {
    try {
        const dashboard = await dashboardService.getDashboardSummary();

        res.status(200).json(dashboard);
    } catch (error) {
        console.error("Get dashboard failed:", error);

        res.status(500).json({
            message: "Unable to fetch dashboard data"
        })
    }
}