import express from "express";
import { Request, Response } from "express";
const PORT = 8000,
  app = express();

app.get("/api/v1", (req: Request, res: Response) => {
  res.send("hello !!!!");
});

app.listen(PORT, () => console.log(`start listening on port : ${PORT}`));
