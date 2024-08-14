export const transformData = (data: any) => {
  const formatDate = (date: any) => {
    if (date && date.$d) {
      return new Date(date.$d).toISOString().split('T')[0];
    }
    return date;
  };

  const formData = new FormData();
  const result = {
    createUserDto: {
      firstName: data.userFirstName,
      middleName: data.userMiddleName,
      lastName: data.userLastName,
      email: data.userEmail,
      profileImage: data.profileImage.file.originFileObj,
      roleId: data.roleId,
    },
    createRolePermissionDto: {
      roleId: data.roleId,
      permissionId: data.setOfPermission,
    },
    createUserPermissionDto: {
      permissionId: data.setOfPermission,
    },
    createEmployeeInformationDto: {
      gender: data.employeeGender,
      martialStatus: data.martialStatus,
      dateOfBirth: formatDate(data.dateOfBirth),
      joinedDate: formatDate(data.joinedDate),
      nationalityId: data.nationalityId,
      addresses: data?.address,
      emergencyContact: data?.emergencyContact,
      bankInformation: data?.bankInformation,
      additionalInformation: data?.additionalInformation,
    },
    createEmployeeJobInformationDto: {
      jobTitle: data.jobTitle,
      branchId: data.branchId,
      isPositionActive: true,
      effectiveStartDate: formatDate(data.joinedDate),
      effectiveEndDate: formatDate(data.effectiveEndDate),
      employmentTypeId: data.employmentTypeId,
      departmentId: data.departmentId,
      departMentLeadOrNot: data.departmentLeadOrNot ?? true,
      employmentContractType: data.employmentContractType,
      workScheduleId: data.workScheduleId,
    },
    createEmployeeDocumentDto: {
      documentName: data.documentName.file.originFileObj,
    },
  };

  // Append the categorized JSON data to formData
  formData.append('createUserDto', JSON.stringify(result.createUserDto));
  formData.append(
    'createRolePermissionDto',
    JSON.stringify(result.createRolePermissionDto),
  );
  formData.append(
    'createUserPermissionDto',
    JSON.stringify(result.createUserPermissionDto),
  );
  formData.append(
    'createEmployeeInformationDto',
    JSON.stringify(result.createEmployeeInformationDto),
  );
  formData.append(
    'createEmployeeJobInformationDto',
    JSON.stringify(result.createEmployeeJobInformationDto),
  );
  formData.append(
    'createEmployeeDocumentDto',
    JSON.stringify(result.createEmployeeDocumentDto),
  );

  // Append files separately
  formData.append('profileImage', data.profileImage.file.originFileObj);
  formData.append('documentName', data.documentName.file.originFileObj);

  return formData;
};
