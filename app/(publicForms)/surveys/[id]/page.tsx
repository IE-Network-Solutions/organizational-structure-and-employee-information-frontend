'use client';
/* eslint-disable local-rules/data-cy-required */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Form, Modal, Skeleton, Tabs } from 'antd';
import {
  CheckCircleFilled,
  FileTextOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import RenderOptions from './_components/fieldTypes';
import {
  isDescriptionRequired,
  RATING_DESCRIPTION_VALUE,
} from './_components/fieldTypes/ratingField';
import { FieldType } from '@/types/enumTypes';
import { usePublicFormStore } from '@/store/uistate/features/feedback/publicForm';
import {
  useSubmitFormResponse,
  useUpdateFormResponse,
} from '@/store/server/features/feedback/dynamicForm/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useFetchQuestions } from '@/store/server/features/feedback/question/queries';
import { useFetchedIndividualResponses } from '@/store/server/features/organization-development/categories/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';
import {
  buildPrefillFromIndividualResponses,
  normalizeIndividualResponsesList,
  inferSubmissionHistoryFromResponseRows,
  getResponseSubmissionIdForRow,
} from './prefillFromIndividualResponses';
import { useRouter } from 'next/navigation';
import { getStoredAuthToken } from '@/utils/getCurrentToken';

interface Params {
  id: string;
}

interface PublicQuestionProps {
  params: Params;
}

function FloatingBranding() {
  return (
    <>
      <style data-cy="public-survey-icon-size-styles">{`
        [data-cy="public-survey-page"] svg,
        [data-cy="public-survey-page-loading"] svg,
        [data-cy="public-survey-page-error"] svg {
          width: 24px !important;
          height: 24px !important;
          flex: 0 0 auto;
        }
      `}</style>
      <div
        className="pointer-events-none relative z-[9999] ml-4 mt-4 sm:fixed sm:ml-0 sm:mt-0 sm:left-6 sm:top-6 lg:left-8"
        data-cy="public-survey-page-logo-wrap"
      >
        <img
          src="/image/selamnew-workspace-logo.svg"
          alt="SelamNew Workspace Logo"
          className="h-10 w-auto object-contain sm:h-11"
          data-cy="public-survey-page-logo"
        />
      </div>

      {/* Desktop: keep the full promo card fixed. */}
      <a
        href="https://selamnew.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group hidden sm:block fixed bottom-4 right-4 z-40 w-[min(92vw,320px)] rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.16)] sm:bottom-6 sm:right-6"
        data-cy="public-survey-promo-card"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Powered by Selamnew
        </p>
        <p className="mt-1 text-sm font-normal leading-snug text-slate-900">
          Run your team faster with one modern HR workspace.
        </p>
        <div className="mt-2 inline-flex items-center rounded-lg bg-[#1E40AF] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(30,64,175,0.28)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_22px_rgba(30,64,175,0.36)]">
          Explore Selamnew Workspace
        </div>
      </a>

      {/* Mobile: non-expandable full-width promo bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 sm:hidden pointer-events-none"
        data-cy="public-survey-promo-mobile"
      >
        <a
          href="https://selamnew.com"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto block w-full border-t border-slate-200 bg-white"
        >
          <div className="px-4 py-3">
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Powered by Selamnew
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">
                Run your team faster with one modern HR workspace.
              </p>

              <span
                className="shrink-0 inline-flex items-center justify-center rounded-lg bg-[#1E40AF] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(30,64,175,0.28)] transition-all duration-200 hover:-translate-y-0.5"
                data-cy="public-survey-promo-mobile-explore"
              >
                Explore
              </span>
            </div>
          </div>
        </a>
      </div>
    </>
  );
}

const Questions = ({ params: { id } }: PublicQuestionProps) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const userId = useAuthenticationStore((s) => s.userId) || null;
  const authToken = useAuthenticationStore((s) => s.token) || null;
  const historyUserId = authToken ? userId : null;
  const {
    data: publicForm,
    isLoading,
    isError,
    error: publicFormError,
  } = useFetchQuestions(id);
  const { mutate: createFormResponse, isLoading: createResponseLoading } =
    useSubmitFormResponse();
  const { mutate: updateFormResponse, isLoading: updateResponseLoading } =
    useUpdateFormResponse();
  const selectedAnswer = usePublicFormStore((s) => s.selectedAnswer);
  const replaceAllSelectedAnswers = usePublicFormStore(
    (s) => s.replaceAllSelectedAnswers,
  );
  const {
    data: individualResponses,
    refetch,
    isLoading: responsesLoading,
  } = useFetchedIndividualResponses(id, historyUserId);

  const responseRows = useMemo(
    () => normalizeIndividualResponsesList(individualResponses),
    [individualResponses],
  );

  const needsUserResponseHistory =
    !!publicForm && !publicForm.isAnonymous && !!historyUserId;

  const awaitingPriorResponses = needsUserResponseHistory && responsesLoading;

  const alreadySubmitted =
    needsUserResponseHistory && !responsesLoading && responseRows.length > 0;

  const [wantsNewResponse, setWantsNewResponse] = useState(true);
  const isUpdateFlow = alreadySubmitted && !wantsNewResponse;
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [loginRequiredModalOpen, setLoginRequiredModalOpen] = useState(false);
  const [authGateReady, setAuthGateReady] = useState(false);

  const prefillAppliedKeyRef = useRef<string | null>(null);

  const redirectToLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', `/surveys/${id}`);
    }
    router.replace('/authentication/login');
  }, [id, router]);

  useEffect(() => {
    if (!publicForm) {
      setAuthGateReady(false);
      return;
    }

    if (publicForm.isAnonymous) {
      setAuthGateReady(true);
      return;
    }

    const token = getStoredAuthToken() || authToken;
    if (!token) {
      redirectToLogin();
      return;
    }

    setAuthGateReady(true);
  }, [publicForm, authToken, redirectToLogin]);

  const submissionHistory = useMemo(
    () => inferSubmissionHistoryFromResponseRows(responseRows),
    [responseRows],
  );

  /** Match admin survey builder: API may not return questions ordered by `order`. */
  const questionsInDisplayOrder = useMemo(() => {
    const list = publicForm?.questions;
    if (!list?.length) return [];
    return [...list].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [publicForm?.questions]);

  const selectedTabKey =
    selectedSubmissionId ??
    submissionHistory[0]?.submissionId ??
    (responseRows.length > 0
      ? getResponseSubmissionIdForRow(responseRows[0])
      : null);
  const latestSubmissionId = submissionHistory[0]?.submissionId ?? null;
  const isViewingOldSubmittedResponse =
    isUpdateFlow &&
    selectedTabKey != null &&
    latestSubmissionId != null &&
    String(selectedTabKey) !== String(latestSubmissionId);

  useLayoutEffect(() => {
    replaceAllSelectedAnswers([]);
    prefillAppliedKeyRef.current = null;
    setWantsNewResponse(true);
    setSelectedSubmissionId(null);
    form.resetFields();
  }, [id, replaceAllSelectedAnswers]);

  useLayoutEffect(() => {
    if (
      !publicForm ||
      !alreadySubmitted ||
      wantsNewResponse ||
      individualResponses == null
    ) {
      return;
    }

    const key = `${id}:${userId ?? ''}:${selectedTabKey ?? 'latest'}`;
    if (prefillAppliedKeyRef.current === key) {
      return;
    }

    const { answers, formValues } = buildPrefillFromIndividualResponses(
      publicForm,
      individualResponses,
      userId,
      selectedTabKey,
    );
    replaceAllSelectedAnswers(answers);
    form.setFieldsValue(formValues);
    prefillAppliedKeyRef.current = key;
  }, [
    publicForm,
    alreadySubmitted,
    individualResponses,
    id,
    userId,
    form,
    replaceAllSelectedAnswers,
    wantsNewResponse,
    selectedTabKey,
  ]);

  const handleStartNewResponse = useCallback(() => {
    setWantsNewResponse(true);
    setSelectedSubmissionId(null);
    prefillAppliedKeyRef.current = null;
    replaceAllSelectedAnswers([]);
    form.resetFields();
  }, [form, replaceAllSelectedAnswers]);

  const handleShowSubmittedResponses = useCallback(() => {
    setWantsNewResponse(false);
    prefillAppliedKeyRef.current = null;
    setSelectedSubmissionId(null); // load latest by default
  }, []);

  const qCount = questionsInDisplayOrder.length;
  const endRaw = publicForm?.endDate ?? publicForm?.end_date;
  const deadlineLabel =
    endRaw && dayjs(endRaw).isValid()
      ? dayjs(endRaw).format('MMM D, YYYY')
      : null;
  const publicFormErrStatus =
    (publicFormError as any)?.response?.status ??
    (publicFormError as any)?.status;
  const publicFormErrText = String(
    (publicFormError as any)?.response?.data?.message ??
      (publicFormError as any)?.response?.data?.error ??
      (publicFormError as any)?.message ??
      '',
  ).toLowerCase();
  const publicFormIsForbidden =
    publicFormErrStatus === 401 ||
    publicFormErrStatus === 403 ||
    publicFormErrText.includes('forbidden') ||
    publicFormErrText.includes('unauthorized') ||
    publicFormErrText.includes('login');

  if (isError) {
    return (
      <div
        className="relative min-h-[100dvh] bg-white"
        data-cy="public-survey-page-error"
      >
        <FloatingBranding />
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            {publicFormIsForbidden ? (
              <>
                <h1 className="text-lg font-semibold text-gray-900">
                  Login required
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Public survey is not supported for this survey. Please log in
                  to continue.
                </p>
                <Button
                  type="primary"
                  className="mt-5 bg-[#1E40AF] hover:!bg-[#1e3a8a]"
                  onClick={() => router.push('/authentication/login')}
                  data-cy="public-survey-page-error-login"
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-900">
                  This survey could not be loaded
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Check the link or try again later. If the problem continues,
                  contact the person who shared the survey.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const requiresLogin =
    !!publicForm && !publicForm.isAnonymous && !authGateReady;

  if (isLoading || !publicForm || awaitingPriorResponses || requiresLogin) {
    return (
      <div
        className="relative min-h-[100dvh] bg-white"
        data-cy="public-survey-page-loading"
      >
        <FloatingBranding />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-white px-6 py-5">
              <Skeleton.Input active className="!h-8 !w-2/3 max-w-md" />
              <Skeleton active paragraph={{ rows: 1 }} className="!mt-4" />
            </div>
            <div className="space-y-6 p-6">
              <Skeleton active paragraph={{ rows: 4 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[100dvh] bg-white"
      data-cy="public-survey-page"
    >
      <FloatingBranding />
      <main className="mx-auto max-w-4xl px-4 pt-8 pb-28 sm:px-6 sm:pt-10 sm:pb-10 lg:pt-12 lg:pb-12">
        <section
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          data-cy="public-survey-header-card"
        >
          <div className="border-b border-gray-100">
            <div className="bg-[#1E40AF] px-5 py-6 text-center sm:px-8 sm:py-7">
              <h1
                className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-[1.75rem]"
                data-cy="public-survey-title"
              >
                {publicForm.name}
              </h1>
              {publicForm.description ? (
                <p
                  className="mx-auto mt-2.5 max-w-2xl text-sm leading-relaxed text-white sm:text-[15px]"
                  data-cy="public-survey-description"
                >
                  {publicForm.description}
                </p>
              ) : null}
            </div>

            <div className="px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800">
                  <FileTextOutlined className="text-gray-500" />
                  {qCount} {qCount === 1 ? 'question' : 'questions'}
                </span>
                {publicForm.isAnonymous ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800">
                    <LockOutlined className="text-gray-500" />
                    Anonymous responses
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800">
                    <UserOutlined className="text-gray-500" />
                    Your response is linked to your account
                  </span>
                )}
                {deadlineLabel ? (
                  <span className="inline-flex items-center rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
                    Closes {deadlineLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {isUpdateFlow ? (
            <div
              className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50/90 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8"
              data-cy="public-forms-surveys-already-submitted-alert"
            >
              <div className="flex min-w-0 items-start gap-3">
                <CheckCircleFilled className="mt-0.5 shrink-0 text-lg text-[#1e40af]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Update your response
                  </p>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    Your saved answers are loaded below. Change what you need,
                    then tap{' '}
                    <span className="font-medium text-gray-800">
                      Update response
                    </span>
                    .
                  </p>
                </div>
              </div>
              <Button
                type="default"
                size="middle"
                className="shrink-0 self-start rounded-lg border-gray-300 font-medium text-gray-800"
                onClick={handleStartNewResponse}
                data-cy="public-survey-submit-new-response"
              >
                Submit a new response
              </Button>
            </div>
          ) : null}

          {alreadySubmitted && wantsNewResponse ? (
            <div
              className="flex flex-col gap-3 border-b border-amber-200/90 bg-amber-50/90 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8"
              data-cy="public-forms-surveys-new-response-mode-alert"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  New submission
                </p>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Fill out the form, then tap{' '}
                  <span className="font-medium text-gray-800">
                    Submit responses
                  </span>{' '}
                  to add another submission.
                </p>
              </div>
              <Button
                type="default"
                size="middle"
                className="shrink-0 self-start rounded-lg border-gray-300 font-medium text-gray-800"
                onClick={handleShowSubmittedResponses}
                data-cy="public-survey-switch-to-update"
              >
                Submitted response
              </Button>
            </div>
          ) : null}

          {alreadySubmitted &&
          !wantsNewResponse &&
          !publicForm?.isAnonymous &&
          submissionHistory.length > 1 ? (
            <div
              className="bg-white px-5 pt-3 pb-0 sm:px-8"
              data-cy="public-survey-submission-history"
            >
              <Tabs
                size="small"
                activeKey={selectedTabKey ?? undefined}
                onChange={(key) => {
                  setSelectedSubmissionId(String(key));
                  prefillAppliedKeyRef.current = null;
                }}
                items={submissionHistory.map((h, idx) => {
                  const labelDate = h.submittedAt
                    ? dayjs(h.submittedAt).format('MMM D, YYYY')
                    : '';
                  return {
                    key: h.submissionId,
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <span>{labelDate || `Response ${idx + 1}`}</span>
                      </span>
                    ),
                  };
                })}
              />
            </div>
          ) : null}

          {isViewingOldSubmittedResponse ? (
            <div
              className="border-b border-amber-200/90 bg-amber-50/90 px-5 py-3 sm:px-8"
              data-cy="public-survey-view-only-old-submission-alert"
            >
              <p className="text-xs text-amber-900 sm:text-sm">
                You are viewing an older submission. Only the latest submission
                can be updated.
              </p>
            </div>
          ) : null}

          <Form
            layout="vertical"
            requiredMark={false}
            className="px-5 py-6 sm:px-8 sm:py-8"
            colon={false}
            disabled={isViewingOldSubmittedResponse}
            // onFinishFailed={({ errorFields }) => {
            //   const firstError = errorFields[0]?.errors?.[0];
            //   NotificationMessage.error({
            //     message:
            //       firstError ??
            //       (isUpdateFlow
            //         ? 'We could not save your update.'
            //         : 'We could not submit your answers.'),
            //     description: isUpdateFlow
            //       ? 'Fix the highlighted questions below, then tap Update response again.'
            //       : 'Fix the highlighted questions below, then submit again.',
            //   });
            // }}
            onFinish={() => {
              if (!publicForm.isAnonymous && !getStoredAuthToken()) {
                redirectToLogin();
                return;
              }

              if (isUpdateFlow) {
                if (isViewingOldSubmittedResponse) {
                  NotificationMessage.error({
                    message: 'Update disabled',
                    description:
                      'Only your latest submitted response can be updated. Switch to the latest tab to edit.',
                  });
                  return;
                }

                const submissionKey = selectedTabKey ?? null;
                if (!submissionKey) {
                  NotificationMessage.error({
                    message: 'Update failed',
                    description:
                      'We could not determine which response to update.',
                  });
                  return;
                }

                const rowsToUpdate = responseRows.filter(
                  (r) => getResponseSubmissionIdForRow(r) === submissionKey,
                );

                if (rowsToUpdate.length === 0) {
                  NotificationMessage.error({
                    message: 'Update failed',
                    description: 'No matching response rows found to update.',
                  });
                  return;
                }

                setIsUpdatingAll(true);
                const updateSequentially = async () => {
                  try {
                    for (const r of rowsToUpdate) {
                      const responseId =
                        r?.id ?? r?.responseId ?? r?.response_id ?? null;
                      const qid = r?.question?.id ?? r?.questionId ?? null;

                      if (!responseId || !qid) continue;

                      const matchingEntry = selectedAnswer.find(
                        (a) => String(a.questionId) === String(qid),
                      );

                      if (!matchingEntry) continue;

                      await new Promise<void>((resolve, reject) => {
                        updateFormResponse(
                          {
                            responseId: String(responseId),
                            values: [matchingEntry],
                          },
                          {
                            onSuccess: () => resolve(),
                            onError: (err) => reject(err),
                          },
                        );
                      });
                    }

                    // Force re-prefill from the updated API response.
                    prefillAppliedKeyRef.current = null;
                    setSelectedSubmissionId(null);
                    await refetch();
                    NotificationMessage.success({
                      message: 'Saved',
                      description: 'Your answers were updated.',
                    });
                    setWantsNewResponse(false);
                  } catch (e: any) {
                    const respData = e?.response?.data ?? e?.data ?? {};
                    const backendMsg =
                      respData?.message ||
                      respData?.Message ||
                      respData?.error ||
                      respData?.errors?.[0]?.message;

                    // Keep detail short but useful.
                    const backendDetails =
                      respData?.details ??
                      respData?.Details ??
                      respData?.error_description;
                    const backendText = `${backendMsg ?? ''} ${backendDetails ?? ''}`
                      .toLowerCase();
                    const isClosedSurvey =
                      backendText.includes('expired') ||
                      backendText.includes('closed') ||
                      backendText.includes('no longer accept responses');

                    NotificationMessage.error({
                      message: 'Update failed',
                      description: isClosedSurvey
                        ? 'This survey is closed and no longer accepts responses.'
                        : backendDetails
                          ? `${backendMsg ?? 'Server error'}`
                          : (backendMsg ??
                            e?.message ??
                            'Something went wrong while saving. Check your connection and try again.'),
                    });
                  } finally {
                    setIsUpdatingAll(false);
                  }
                };

                updateSequentially();
                return;
              }

              createFormResponse(
                { id: id, values: selectedAnswer },
                {
                  onSuccess: () => {
                    prefillAppliedKeyRef.current = null;
                    refetch();
                    NotificationMessage.success({
                      message: 'Submitted',
                      description: 'Thank you for completing this survey.',
                    });
                    setWantsNewResponse(false);
                  },
                  onError: (e: any) => {
                    const status = e?.response?.status ?? e?.status;
                    const respData = e?.response?.data ?? e?.data ?? {};
                    const backendMsg = String(
                      respData?.message ??
                        respData?.Message ??
                        respData?.error ??
                        e?.message ??
                        '',
                    ).toLowerCase();
                    const backendDetails = String(
                      respData?.details ??
                        respData?.Details ??
                        respData?.error_description ??
                        '',
                    ).toLowerCase();
                    const looksLikeAuthBlock =
                      status === 401 ||
                      status === 403 ||
                      backendMsg.includes('forbidden') ||
                      backendMsg.includes('unauthorized') ||
                      backendMsg.includes('login') ||
                      backendDetails.includes('forbidden') ||
                      backendDetails.includes('unauthorized') ||
                      backendDetails.includes('login');

                    if (looksLikeAuthBlock) {
                      setLoginRequiredModalOpen(true);
                      return;
                    }

                    // NotificationMessage.error({
                    //   message: 'Submit failed',
                    //   description:
                    //     'Something went wrong. Check your connection and try again.',
                    // });
                  },
                },
              );
            }}
            form={form}
          >
            <div className="space-y-6">
              {questionsInDisplayOrder.map((q: any, index: number) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-gray-100 bg-slate-50/40 p-4 sm:p-5"
                  data-cy={`public-survey-question-${q.id}`}
                >
                  <div className="mb-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className="shrink-0 tabular-nums text-[15px] font-normal leading-snug text-gray-900 sm:text-base"
                        aria-hidden
                      >
                        {index + 1}.
                      </span>
                      <span className="min-w-0 text-[15px] font-normal leading-snug text-gray-900 sm:text-base">
                        {q.question}
                        {q.required ? (
                          <>
                            <span className="text-red-600" aria-hidden="true">
                              {' '}
                              *
                            </span>
                            <span className="sr-only"> (required)</span>
                          </>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  <Form.Item
                    name={`question_${q.id}`}
                    required={false}
                    className="!mb-0"
                    label={null}
                    help={q.fieldType === FieldType.RATING ? '' : undefined}
                    rules={(() => {
                      const rules: {
                        required?: boolean;
                        message?: string;
                        validator?: (
                          _: unknown,
                          value: unknown,
                        ) => Promise<void>;
                      }[] = [];
                      if (q.required) {
                        rules.push({
                          required: true,
                          message: 'This field is required.',
                        });
                      }
                      if (
                        q.fieldType === FieldType.RATING &&
                        isDescriptionRequired(
                          (q.field ?? []).find(
                            (f: { value?: string }) =>
                              f.value === RATING_DESCRIPTION_VALUE,
                          ),
                        )
                      ) {
                        rules.push({
                          validator: async () => {
                            const entry = usePublicFormStore
                              .getState()
                              .selectedAnswer.find(
                                (a) => String(a.questionId) === String(q.id),
                              );
                            const descField = (q.field ?? []).find(
                              (f: { value?: string; id?: string }) =>
                                f.value === RATING_DESCRIPTION_VALUE,
                            );
                            const descId = descField?.id;
                            const feedback = entry?.responseDetail?.find(
                              (d) =>
                                descId != null &&
                                String(d.id) === String(descId),
                            )?.value;
                            if (
                              feedback == null ||
                              String(feedback).trim() === '' ||
                              feedback === RATING_DESCRIPTION_VALUE
                            ) {
                              return Promise.reject(
                                new Error('Feedback or description is required.'),
                              );
                            }
                          },
                        });
                      }
                      return rules;
                    })()}
                  >
                    <RenderOptions
                      type={q?.fieldType}
                      questionId={q?.id}
                      field={q?.field}
                      form={form}
                      isAnonymous={publicForm?.isAnonymous}
                      disabled={isViewingOldSubmittedResponse}
                    />
                  </Form.Item>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 sm:mt-10 sm:pt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 sm:text-sm">
                  {isUpdateFlow
                    ? 'By updating, you confirm your revised answers are accurate to the best of your knowledge.'
                    : 'By submitting, you confirm your answers are accurate to the best of your knowledge.'}
                </p>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isViewingOldSubmittedResponse}
                  loading={
                    isUpdateFlow
                      ? isUpdatingAll || updateResponseLoading
                      : createResponseLoading
                  }
                  size="large"
                  className="min-h-11 min-w-[140px] rounded-lg border-0 bg-[#1e40af] font-semibold shadow-none hover:!bg-[#1e3a8a] sm:min-w-[160px]"
                  data-cy={
                    isUpdateFlow
                      ? 'public-survey-update-response'
                      : 'public-survey-submit'
                  }
                >
                  {isUpdateFlow
                    ? isViewingOldSubmittedResponse
                      ? 'View only'
                      : 'Update response'
                    : 'Submit responses'}
                </Button>
              </div>
            </div>
          </Form>
        </section>
      </main>
      <Modal
        open={loginRequiredModalOpen}
        onCancel={() => setLoginRequiredModalOpen(false)}
        centered
        title="Login required"
        footer={[
          <Button
            key="close"
            onClick={() => setLoginRequiredModalOpen(false)}
            data-cy="public-survey-login-required-close"
          >
            Close
          </Button>,
          <Button
            key="login"
            type="primary"
            className="bg-[#1E40AF] hover:!bg-[#1e3a8a]"
            onClick={() => router.push('/authentication/login')}
            data-cy="public-survey-login-required-login"
          >
            Login
          </Button>,
        ]}
      >
        <p
          className="text-sm text-slate-700"
          data-cy="public-survey-login-required-message"
        >
          Public survey submission is not supported for this survey. Please log
          in to submit a response.
        </p>
      </Modal>
    </div>
  );
};

export default Questions;
