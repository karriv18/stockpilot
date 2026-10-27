import express from "express"
import path from "node:path";
import cors from "cors"
import authRoutes from "./auth/auth.routes";
import productRoutes from "./products/products.routes";
import inventoryRoutes from "./inventory/inventory.routes"
import dashboardRoutes from "./dashboard/dashboard.routes";

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Umpisa is working"
    })
})

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/uploads", express.static(
  path.resolve(process.cwd(), "uploads")
));

app.use("/api/inventory", inventoryRoutes);

app.use("/api/dashboard", dashboardRoutes);
export default app;
