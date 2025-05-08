"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = validateUser;
const prismaclient_1 = require("../prismaClient/prismaclient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function validateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(404).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const validateToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!validateToken || typeof validateToken === "string") {
                res.status(404).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const user = yield prismaclient_1.prismaClient.user.findUnique({
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
            req.userId = user === null || user === void 0 ? void 0 : user.id;
            next();
        }
        catch (error) {
            console.log("🚀 ~ validateUser ~ error:", error);
            res.status(500).json({
                success: false,
                message: "internal server error",
            });
            return;
        }
    });
}
