import * as ExcelJS from 'exceljs';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface EmployeeUser {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

interface CriteriaScore {
  name?: string;
  score?: string | number;
}

interface RecognitionEmployeeRow {
  recipientId?: string;
  id?: string;
  totalPoints?: string | number;
  criteriaScore?: CriteriaScore[];
}

const normalizeUsers = (users: EmployeeUser[] | undefined) => {
  if (!users) return [];
  if (Array.isArray(users)) return users;
  return [];
};

const getEmployeeName = (
  recipientId: string | undefined,
  users: EmployeeUser[] | undefined,
) => {
  if (!recipientId) return 'Unknown';
  const user = normalizeUsers(users).find(
    (item) => String(item.id) === String(recipientId),
  );
  if (!user) return 'Unknown';
  return (
    `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
      .replace(/\s+/g, ' ')
      .trim() || 'Unknown'
  );
};

export const useRecognitionEmployeesExport = () => {
  const exportRecognitionEmployees = async (
    employees: RecognitionEmployeeRow[],
    users: EmployeeUser[] | undefined,
    fileName: string = 'Recognition_Employees',
  ) => {
    if (!employees?.length) {
      NotificationMessage.warning({
        message: 'No Employees',
        description: 'There are no employees to export.',
      });
      return false;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      worksheet.columns = [
        { header: 'Employee Name', key: 'employeeName', width: 30 },
        { header: 'Criteria', key: 'criteria', width: 45 },
        { header: 'Total Value', key: 'totalPoints', width: 15 },
      ];

      employees.forEach((employee) => {
        const recipientId = employee.recipientId ?? employee.id;
        worksheet.addRow({
          employeeName: getEmployeeName(recipientId, users),
          criteria:
            employee.criteriaScore
              ?.map((c) => c.name)
              .filter(Boolean)
              .join(', ') || '-',
          totalPoints: employee.totalPoints ?? 0,
        });
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12 };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3498DB' },
      };
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8F9FA' },
            };
          }
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      NotificationMessage.success({
        message: 'Export Successful',
        description: 'Employees exported to Excel successfully.',
      });
      return true;
    } catch {
      NotificationMessage.error({
        message: 'Export Failed',
        description: 'Failed to export employees. Please try again.',
      });
      return false;
    }
  };

  return { exportRecognitionEmployees };
};
