import { apiFetch } from "@/lib/api-client";
import { mapUserRes, type UserResDto } from "@/lib/api/mappers";

export type RegisterUserBody = {
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  phone?: string;
};

export async function registerUser(body: RegisterUserBody) {
  const dto = await apiFetch<UserResDto>("/users", {
    method: "POST",
    body: JSON.stringify({
      username: body.username,
      passwordHash: body.passwordHash,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      role: "USER",
    }),
  });
  return mapUserRes(dto);
}

export async function updateUser(
  userId: number,
  patch: { username: string; fullName: string; email: string; phone?: string }
) {
  const dto = await apiFetch<UserResDto>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      username: patch.username,
      passwordHash: "unchanged",
      fullName: patch.fullName,
      email: patch.email,
      phone: patch.phone,
    }),
  });
  return mapUserRes(dto);
}

export async function fetchAllUsers() {
  const list = await apiFetch<UserResDto[]>("/users");
  return list.map(mapUserRes);
}

export async function fetchUsersRaw() {
  return apiFetch<UserResDto[]>("/users");
}

export async function patchUserRole(userId: number, role: string) {
  return apiFetch<UserResDto>(
    `/users/${userId}/role?role=${encodeURIComponent(role)}`,
    { method: "PATCH" }
  );
}

export async function patchUserStatus(userId: number, active: boolean) {
  return apiFetch<UserResDto>(`/users/${userId}/status?status=${active}`, { method: "PATCH" });
}
