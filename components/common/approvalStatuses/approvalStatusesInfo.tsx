import Image from 'next/image';

const ApprovalStatusesInfo = () => {
  const statuses = [
    {
      text: 'Approved',
      img: '/icons/status/verify.svg',
    },
    {
      text: 'Pending',
      img: '/icons/status/information.svg',
    },
    {
      text: 'Reject',
      img: '/icons/status/reject.svg',
    },
  ];

  return (
    <div
      className="flex items-center gap-2.5 py-[5px] px-3 rounded-lg w-max"
      data-cy="approval-statuses-info"
    >
      {statuses.map((status) => (
        <div
          key={status.text}
          className="flex items-center gap-[5px]"
          data-cy="approval-status-item"
        >
          <Image unoptimized width={24} height={24} src={status.img} alt="" />
          <span
            data-cy="components-common-approvalstatuses-approvalstatusesinfo-tsx-approvalstatusesinfo-span-31"
            className="text-xs font-medium text-gray-900"
          >
            {status.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ApprovalStatusesInfo;
