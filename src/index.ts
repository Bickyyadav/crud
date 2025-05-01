import express from 'express';
import { prismaClient } from './prismaClient/prismaclient';
import bcrypt from 'bcryptjs';

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
  const hashPassword = await bcrypt.hash(password, 10);
  const data = {
    email,
    password: hashPassword,
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

app.post('/delete-user', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🚀 ~ app.post ~ email:', email);
    if (!email) {
      res.json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }
    const user = await prismaClient.user.findUnique({
      where: { email },
    });
    if (!user) {
      res.json({
        success: false,
        message: 'user does not exist',
      });
      return;
    }
    await prismaClient.user.delete({
      where: {
        email,
      },
    });
    res.json({
      message: 'user deleted successfully',
    });
    return;
  } catch (error) {
    console.log('🚀 ~ app.post ~ error:', error);
  }
});

app.post('/update-user', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email) {
      res.json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      res.json({
        success: false,
        message: 'user does not exist',
      });
      return;
    }
    //updating the field
    type update = {
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    const updateData: update = {};
    if (password) updateData.password = password;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    const updateUser = await prismaClient.user.update({
      where: {
        email,
      },
      data: updateData,
    });
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updateUser,
    });
  } catch (error) {
    console.log('🚀 ~ app.get ~ error:', error);
  }
});

app.listen(3000, () => {
  console.log('server is running on port number 3000');
});
