import type { Request, Response, NextFunction } from "express";
import * as userService from "./user.service.js";
import { assertAuthenticated } from "../../helper/assertAuthenticated.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await userService.registerUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(202).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await userService.verifyRegistrationOtp({
      userId: req.body.userId,
      otp: req.body.otp,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await userService.resendRegistrationOtp(req.body.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.loginUser({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    assertAuthenticated(req);
    const user = await userService.getUserById(req.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    assertAuthenticated(req);

    const user = await userService.updateUser(req.userId, req.body);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    assertAuthenticated(req);
    const result = await userService.changeUserPassword(req.userId, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    assertAuthenticated(req);
    const result = await userService.deleteUser(req.userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    assertAuthenticated(req);

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 50",
      });
    }

    const result = await userService.getUsers({
      userId: req.userId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
