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
