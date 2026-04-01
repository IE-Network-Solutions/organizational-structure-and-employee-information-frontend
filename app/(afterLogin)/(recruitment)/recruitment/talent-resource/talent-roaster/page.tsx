'use client';
import TalentRoasterTable from './_components/table';
import CreateTalentRoaster from './_components/drawer';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import AddToJobPipeline from './_components/modal';
import { useGetAllJobs } from '@/store/server/features/recruitment/job/queries';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useCreateCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useDeleteTalentRoaster } from '@/store/server/features/recruitment/talent-roaster/mutation';

// Define the interface that matches the table data structure
interface TalentRoasterItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  CGPA: number;
  departmentId: string;
  createdAt: string;
  resumeUrl: string;
  documentName?: string;
  graduateYear: string;
  coverLetter?: string;
}

const TalentRoasterPage = () => {
  const {
    createTalentRoasterDrawer,
    setCreateTalentRoasterDrawer,
    setEditData,
    editData,
    selectedTalentRoaster,
    setMoveToJobPipelineModal,
    moveToJobPipelineModal,
    setSelectedTalentRoaster,
  } = useTalentRoasterStore();

  const { searchParams } = useCandidateState();

  const handleEdit = (data: TalentRoasterItem) => {
    setCreateTalentRoasterDrawer(true);
    setEditData(data);
  };

  const onClose = () => {
    setCreateTalentRoasterDrawer(false);
    setEditData(null);
    return true;
  };

  const onCancel = () => {
    setMoveToJobPipelineModal(false);
  };

  const handleRemoveCandidate = (candidateId: string) => {
    const updatedCandidates =
      selectedTalentRoaster?.filter(
        (candidate: TalentRoasterItem) => candidate.id !== candidateId,
      ) || [];
    setSelectedTalentRoaster(updatedCandidates);
  };

  const { data: jobList } = useGetAllJobs(searchParams?.whatYouNeed || '');
  const { mutate: createCandidate } = useCreateCandidate();
  const { mutate: deleteTalentRoaster } = useDeleteTalentRoaster();
  const { data: statusStage } = useGetStages();

  // ==========> Initial Stage Id <=========

  const handleMoveHandler = (values: Record<string, string>) => {
    // ==========> Initial Stage Id <=========
    const titleToFind = 'Initial Stage';
    const foundStage = statusStage?.items?.find(
      (stage: any) => stage.title === titleToFind,
    );

    const stageId = foundStage ? foundStage.id : '';
    const formattedValues = {
      isExternal: false,
      jobInformationId: values?.jobId,
      applicantStatusStageId: stageId,
      createdBy: selectedTalentRoaster?.[0]?.id,
      email: selectedTalentRoaster?.[0]?.email,
      phone: selectedTalentRoaster?.[0]?.phone,
      fullName: selectedTalentRoaster?.[0]?.fullName,
      resumeUrl: selectedTalentRoaster?.[0]?.resumeUrl,
      coverLetter: selectedTalentRoaster?.[0]?.coverLetter,
    };

    // formData.append('newFormData', JSON.stringify(formattedValues));
    createCandidate(
      { newFormData: formattedValues },
      {
        onSuccess: () => {
          deleteTalentRoaster(selectedTalentRoaster?.[0]?.id);
        },
      },
    );
  };
  const today = new Date();

  const isNotExpired = (job: any) => {
    return new Date(job.jobDeadline) >= today;
  };
  const filteredJobs = jobList?.items?.filter(isNotExpired);

  return (
    <div
      id="talent-acquisition-talent-roaster-page-div-container"
      data-cy="talent-acquisition-talent-roaster-page-div-container"
    >
      <div
        id="talent-acquisition-talent-roaster-page-div-content"
        data-cy="talent-acquisition-talent-roaster-page-div-content"
      >
        <TalentRoasterTable
          data-cy="talent-acquisition-talent-roaster-table"
          onEdit={handleEdit}
        />
        <CreateTalentRoaster
          open={createTalentRoasterDrawer}
          data-cy="talent-acquisition-talent-roaster-create-talent-roaster"
          onClose={onClose}
          editData={editData}
          isEdit={!!editData}
        />
        <AddToJobPipeline
          data-cy="talent-acquisition-talent-roaster-add-to-job-pipeline"
          open={moveToJobPipelineModal}
          onCancel={onCancel}
          selectedCandidates={selectedTalentRoaster}
          onRemoveCandidate={handleRemoveCandidate}
          availableJobs={filteredJobs}
          onSubmit={(record) => handleMoveHandler(record)}
        />
      </div>
    </div>
  );
};

export default TalentRoasterPage;
