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
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send("ok my lord");
});
app.post('/create-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
            success: false,
            message: 'all fields are required',
        });
        return;
    }
    const data = {
        email,
        password,
        firstName,
        lastName,
    };
    const user = yield prismaclient_1.prismaClient.user.create({
        data: data,
    });
    res.status(200).json({
        data: user,
        success: true,
        message: 'User created successfully',
    });
}));
app.get('/get-allUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prismaclient_1.prismaClient.user.findMany();
    res.json({
        message: 'successfully get All user',
        users,
    });
}));
app.listen(3000, () => {
    console.log('server is running on port number 3000');
});
