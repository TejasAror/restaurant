import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import restaurantRoute from "./routes/restaurant.route.js";
import menuRoute from "./routes/menu.route.js";
import orderRoute from "./routes/order.route.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const DIRNAME= path.resolve();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/menu", orderRoute);

app.use(express.static(path.join(DIRNAME,"/client/dist")));
// app.use("*", (_,res) => {
//     res.sendFile(path.resolve(DIRNAME, "client", "dist", "index.html"));
// });


app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server listening at port ${PORT}`);
});
