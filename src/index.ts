import express from "express";
import { prismaClient } from "./prismaClient/prismaclient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateUser } from "./middleware/auth";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("ok my lord");
});

app.post("/sign-up", async (req, res) => {
  const { email, password, username, fullName } = req.body;

  if (!email || !password || !username || !fullName) {
    res.status(400).json({
      success: false,
      message: "all fields are required",
    });
    return;
  }

  const userExists = await prismaClient.user.findUnique({
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

  const hashPassword = await bcrypt.hash(password, 10);
  const data = {
    email,
    password: hashPassword,
    username,
    fullName,
  };
  const user = await prismaClient.user.create({
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
});



app.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "all fields are required",
      });
      return;
    }

    const user = await prismaClient.user.findUnique({
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

    const checkPassword = await bcrypt.compare(password, user.password);
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
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);

    res.status(200).json({
      success: true,
      message: "sign-in successfully",

      data: token,
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
});

app.post("/create-todo", validateUser, async (req, res) => {
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

  const createTodo = await prismaClient.todo.create({
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
});

app.get("/mark-completed", validateUser, async (req, res) => {
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

  const getTodo = await prismaClient.todo.findUnique({
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

  const markTodo = await prismaClient.todo.update({
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
});

app.get("/get-all-todo", validateUser, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const todos = await prismaClient.todo.findMany({
    where: {
      userId,
    },
  });

  res.status(200).json({
    success: true,
    message: "fetched all todo",
    data: todos,
  });
});

app.listen(8000, () => {
  console.log("server is running on port number 3000");
});
