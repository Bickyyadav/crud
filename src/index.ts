import express from 'express';
import { prismaClient } from './prismaClient/prismaclient';

import dotenv from 'dotenv';
dotenv.config({});

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ok my lord');
});

app.post('/create-user', async (req, res) => {
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
  const user = await prismaClient.user.create({
    data: data,
  });

  res.status(200).json({
    data: user,
    success: true,
    message: 'User created successfully',
  });
});

app.get('/get-allUser', async (req, res) => {
  const users = await prismaClient.user.findMany();
  res.json({
    message: 'successfully get All user',
    users,
  });
});

app.listen(3000, () => {
  console.log('server is running on port number 3000');
});
