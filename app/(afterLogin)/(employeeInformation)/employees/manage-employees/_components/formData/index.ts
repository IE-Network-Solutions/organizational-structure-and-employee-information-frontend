export function transformData(data:any) {
    // Helper function to format dates
    const formatDate = (date:any) => {
      if (date && date.$d) {
        return new Date(date.$d).toISOString().split('T')[0];
      }
      return date;
    };
  
    // Categorizing the keys
    const result = {
      createUserDto: {
        firstName: data.userFirstName,
        middleName: data.userMiddleName,
        lastName: data.userLastName,
        email: data.userEmail,
        profileImage: {
          file: data.profileImage.file,
          fileList: data.profileImage.fileList.map((file:any) => ({
            ...file,
            lastModified: new Date(file.lastModified).toISOString().split('T')[0],
          })),
        },
        roleId: data.roleId,
      },
      createRolePermissionDto:{
        roleId: data.roleId,
        permissionId: data.setOfPermission,
      },
      createUserPermissionDto:{
        permissionId: data.setOfPermission,

      },
      createEmployeeInformationDto:{
        gender: data.employeeGender,
        martialStatus: data.martialStatus,
        dateOfBirth: formatDate(data.dateOfBirth),
        joinedDate: formatDate(data.joinedDate),
        nationalityId: data.nationalityId,
        addresses: JSON.stringify({
          country: data.addressCountry,
          city: data.addressCity,
          subcity: data.addressSubcity,
          woreda: data.addressWoreda,
          primaryAddress: data.addressPrimaryAddress,
          houseNumber: data.addressHouseNumber,
        }),
        emergencyContact: JSON.stringify({
          fullName: data.emergencyContactfullName,
          lastName: data.emergencyContactlastName,
          emailAddress: data.emergencyContactemailAddress,
          gender: data.emergencyContactgender,
          dateOfBirth: formatDate(data.emergencyContactDateOfBirth),
          nationality: data.emergencyContactNationality,
        }),
        bankInformation: JSON.stringify({
          bankName: data.bankName,
          branch: data.branch,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
        }),
        additionalInformation:JSON.stringify({}),
      },     
      createEmployeeJobInformationDto: {
        jobTitle: data.jobTitle,
        branchId: data.branchId,
        isPositionActive:true,
        effectiveStartDate: formatDate(data.joinedDate),
        effectiveEndDate: formatDate(data.effectiveEndDate),
        employmentTypeId: data.employmentTypeId,
        departmentId: '49cbac11-6c18-4c01-bba1-bf1969d29f48' ?? data.departmentId,
        departMentLeadOrNot:data.departmentLeadOrNot ?? true, //////////////////////
        employementContractType: data.employmentContractType,
        workScheduleId: data.workScheduleId,
      },
      createEmployeeDocumentDto: {
        documentName: JSON.stringify({
          file: data.documentName.file,
          fileList: data.documentName.fileList.map((file:any) => ({
            ...file,
            lastModified: new Date(file.lastModified).toISOString().split('T')[0],
          })),
        })
      },
      profileImage: {
        file: data.profileImage.file,
        // fileList: data.profileImage.fileList.map((file:any) => ({
        //   ...file,
        //   lastModified: new Date(file.lastModified).toISOString().split('T')[0],
        // })),
      },
    };
  
    return result;
  }