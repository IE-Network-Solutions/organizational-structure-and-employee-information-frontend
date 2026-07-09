const splitFullName = (fullName?: string) => {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      userFirstName: undefined,
      userMiddleName: undefined,
      userLastName: undefined,
    };
  }

  if (parts.length === 1) {
    return {
      userFirstName: parts[0],
      userMiddleName: undefined,
      userLastName: undefined,
    };
  }

  if (parts.length === 2) {
    return {
      userFirstName: parts[0],
      userMiddleName: undefined,
      userLastName: parts[1],
    };
  }

  if (parts.length === 3) {
    return {
      userFirstName: parts[0],
      userMiddleName: parts[1],
      userLastName: parts[2],
    };
  }

  return {
    userFirstName: parts[0],
    userMiddleName: undefined,
    userLastName: parts[parts.length - 1],
  };
};

export const mapCandidateToEmployeePrefill = (candidate: any) => {
  if (!candidate) return null;

  const { userFirstName, userMiddleName, userLastName } = splitFullName(
    candidate.fullName ?? candidate.candidateName,
  );

  const prefill: Record<string, unknown> = {};

  if (userFirstName) prefill.userFirstName = userFirstName;
  if (userMiddleName) prefill.userMiddleName = userMiddleName;
  if (userLastName) prefill.userLastName = userLastName;
  if (candidate.email) prefill.userEmail = candidate.email;

  const address: Record<string, string> = {};
  if (candidate.country) address.country = candidate.country;
  if (candidate.city) address.city = candidate.city;
  if (candidate.address) address.subCity = candidate.address;
  if (candidate.phone) address.phoneNumber = candidate.phone;

  if (Object.keys(address).length > 0) {
    prefill.address = address;
  }

  return Object.keys(prefill).length > 0 ? prefill : null;
};
