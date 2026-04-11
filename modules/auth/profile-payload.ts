export type UpdateProfilePayload = Partial<{
  fullName: string;
  institution: string | null;
  matricNumber: string | null;
  studentAcademicLevel: string | null;
  dateOfBirth: string | null;
  lecturerHighestQualification: string | null;
  lecturerCurrentAcademicStage: string | null;
}>;

type UserRole = "STUDENT" | "LECTURER";

export function buildProfileUpdatePayload(
  role: UserRole,
  payload: UpdateProfilePayload,
): UpdateProfilePayload {
  const nextPayload: UpdateProfilePayload = {
    ...(payload.fullName !== undefined
      ? { fullName: payload.fullName.trim() }
      : {}),
    ...(payload.institution !== undefined
      ? { institution: payload.institution }
      : {}),
  };

  if (role === "STUDENT") {
    return {
      ...nextPayload,
      ...(payload.matricNumber !== undefined
        ? { matricNumber: payload.matricNumber }
        : {}),
      ...(payload.studentAcademicLevel !== undefined
        ? { studentAcademicLevel: payload.studentAcademicLevel }
        : {}),
      ...(payload.dateOfBirth !== undefined
        ? { dateOfBirth: payload.dateOfBirth }
        : {}),
    };
  }

  return {
    ...nextPayload,
    ...(payload.lecturerHighestQualification !== undefined
      ? {
          lecturerHighestQualification: payload.lecturerHighestQualification,
        }
      : {}),
    ...(payload.lecturerCurrentAcademicStage !== undefined
      ? {
          lecturerCurrentAcademicStage: payload.lecturerCurrentAcademicStage,
        }
      : {}),
  };
}
