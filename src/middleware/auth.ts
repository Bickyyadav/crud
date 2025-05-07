import { truncates } from "bcryptjs";
import { NextFunction, Response, Request } from "express";
import { prismaClient } from "../prismaClient/prismaclient";
import jwt from "jsonwebtoken";

export async function validateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const validateToken = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!validateToken || typeof validateToken === "string") {
      res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: validateToken.id,
      },
    });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    //@ts-ignore
    req.userId = user?.id;

    next();
  } catch (error) {
    console.log("🚀 ~ validateUser ~ error:", error)
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
  }
}
