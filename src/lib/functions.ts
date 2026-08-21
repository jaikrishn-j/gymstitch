import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type { Permission } from "../auth/auth-types";

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planId?: string;
  whatsapp?: string;
  bloodGroup?: string;
  dob?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
};

export type CreateMemberResult = {
  uid: string;
  resetLink: string;
};

export type CreateStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: "staff" | "admin";
  permission?: Permission;
};

export type CreateStaffResult = {
  uid: string;
  resetLink: string;
};

export type DeleteStaffInput = {
  uid: string;
};

export type DeleteStaffResult = {
  deleted: boolean;
};

export type UpdateStaffInput = {
  uid: string;
  role: "staff" | "admin";
  permission?: Permission;
};

export type UpdateStaffResult = {
  updated: boolean;
};

export type GetStaffResetLinkInput = {
  uid: string;
};

export type GetStaffResetLinkResult = {
  resetLink: string;
};

export type CreateRazorpayOrderInput = {
  planId: string;
  planName: string;
  amount: number;
  days: number;
};

export type CreateRazorpayOrderResult = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  clientId: string;
};

export type SavePaymentGatewayConfigInput = {
  keyId: string;
  secretKey: string;
  webhookSecret: string;
  envMode: "test" | "live";
  enabled: boolean;
};

export type SavePaymentGatewayConfigResult = {
  saved: boolean;
};

export const createMember = httpsCallable<CreateMemberInput, CreateMemberResult>(
  functions,
  "createMember",
);

export const createStaff = httpsCallable<CreateStaffInput, CreateStaffResult>(
  functions,
  "createStaff",
);

export const deleteStaff = httpsCallable<DeleteStaffInput, DeleteStaffResult>(
  functions,
  "deleteStaff",
);

export const updateStaff = httpsCallable<UpdateStaffInput, UpdateStaffResult>(
  functions,
  "updateStaff",
);

export const getStaffResetLink = httpsCallable<
  GetStaffResetLinkInput,
  GetStaffResetLinkResult
>(functions, "getStaffResetLink");

export const createRazorpayOrder = httpsCallable<
  CreateRazorpayOrderInput,
  CreateRazorpayOrderResult
>(functions, "createRazorpayOrder");

export const savePaymentGatewayConfig = httpsCallable<
  SavePaymentGatewayConfigInput,
  SavePaymentGatewayConfigResult
>(functions, "savePaymentGatewayConfig");
