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
const express_1 = __importDefault(require("express"));
const prismaclient_1 = require("./prismaClient/prismaclient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./middleware/auth");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get("/", (req, res) => {
    res.send("ok my lord");
});
app.post("/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username, fullName } = req.body;
    if (!email || !password || !username || !fullName) {
        res.status(400).json({
            success: false,
            message: "all fields are required",
        });
        return;
    }
    const userExists = yield prismaclient_1.prismaClient.user.findUnique({
        where: {
            email,
        },
    });
    if (userExists) {
        res.status(400).json({
            success: false,
            message: "email already in use",
        });
        return;
    }
    const hashPassword = yield bcryptjs_1.default.hash(password, 10);
    const data = {
        email,
        password: hashPassword,
        username,
        fullName,
    };
    const user = yield prismaclient_1.prismaClient.user.create({
        data: data,
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
        },
    });
    res.status(200).json({
        data: user,
        success: true,
        message: "User created successfully",
    });
}));
app.post("/sign-in", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "all fields are required",
            });
            return;
        }
        const user = yield prismaclient_1.prismaClient.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const checkPassword = yield bcryptjs_1.default.compare(password, user.password);
        console.log("🚀 ~ app.post ~ checkPassword:", checkPassword);
        if (!checkPassword) {
            res.status(403).json({
                success: false,
                message: "Incorrect password",
            });
            return;
        }
        const payload = {
            id: user.id,
            email: user.email,
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
        res.status(200).json({
            success: true,
            message: "sign-in successfully",
            data: token,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }
}));
app.post("/create-todo", auth_1.validateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const { title, description } = req.body;
    if (!title || !description) {
        res.status(400).json({
            success: false,
            message: "all fields are required",
        });
        return;
    }
    const createTodo = yield prismaclient_1.prismaClient.todo.create({
        data: {
            title: title,
            description,
            userId,
        },
    });
    res.status(200).json({
        success: true,
        message: "Todo created successfully",
        data: createTodo,
    });
}));
app.get("/mark-completed", auth_1.validateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { completed, todoId } = req.query;
    console.log("🚀 ~ app.get ~ completed:", completed);
    console.log("🚀 ~ app.get ~ todoId:", todoId);
    if (!todoId || !completed || typeof todoId !== "string") {
        res.status(400).json({
            success: false,
            message: "all fields are required",
        });
        return;
    }
    const getTodo = yield prismaclient_1.prismaClient.todo.findUnique({
        where: {
            id: todoId,
        },
    });
    if (!getTodo) {
        res.status(404).json({
            success: false,
            message: "todo not found",
            data: [],
        });
        return;
    }
    const markAsCompleted = completed === "true";
    const markTodo = yield prismaclient_1.prismaClient.todo.update({
        where: {
            id: todoId,
        },
        data: {
            completed: markAsCompleted,
        },
    });
    res.status(200).json({
        success: true,
        message: "marked successfully",
        data: markTodo,
    });
}));
app.get("/get-all-todo", auth_1.validateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const todos = yield prismaclient_1.prismaClient.todo.findMany({
        where: {
            userId,
        },
    });
    res.status(200).json({
        success: true,
        message: "fetched all todo",
        data: todos,
    });
}));
app.listen(8000, () => {
    console.log("server is running on port number 3000");
});
