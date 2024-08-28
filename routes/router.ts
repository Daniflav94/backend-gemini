import express from "express";

export const router = express();

router.use("/api/", require("./measureRoutes"));
