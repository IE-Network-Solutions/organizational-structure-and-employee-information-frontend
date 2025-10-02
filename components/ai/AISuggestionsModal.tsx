import React, { useMemo, useState } from 'react';
import { Button, Modal, Select, Typography, Tag, Input, Empty } from 'antd';
import { fetchWeeklyPlanSuggestions, fetchDailyPlanSuggestions } from '@/utils/aiService';

type KeyResultOption = { id: string; title: string };
type WeeklyPlanTask = { id: string; task: string };

interface AISuggestionsModalProps {
  getKeyResults: () => KeyResultOption[];
  getWeeklyPlanTasks?: () => WeeklyPlanTask[]; // Function to get weekly plan tasks for daily planning
  form: any;
  handleAddBoard: (key: string) => void;
  handleAddName?: (values: Record<string, any>, key: string) => void; // Function to save the task
  planTypeName?: string; // 'Weekly' | 'Daily' | others
  resolveListNameForKR?: (krId: string) => string; // returns form list name e.g., names-<id or composite>
  resolveBoardKeyForKR?: (krId: string) => string; // what to pass to handleAddBoard
  hasParentPlan?: boolean; // Explicitly indicates if this is a child plan (e.g., Daily under Weekly)
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  getKeyResults,
  getWeeklyPlanTasks,
  form,
  handleAddBoard,
  handleAddName,
  planTypeName,
  resolveListNameForKR,
  resolveBoardKeyForKR,
  hasParentPlan,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyResultId, setKeyResultId] = useState<string | undefined>();
  const [weeklyPlanTaskId, setWeeklyPlanTaskId] = useState<string | undefined>();
  const [items, setItems] = useState<
    { title: string; weight: number; priority: string; target?: number }[]
  >([]);

  const keyResults = useMemo(() => getKeyResults(), [getKeyResults]);
  const weeklyPlanTasks = useMemo(() => getWeeklyPlanTasks?.() || [], [getWeeklyPlanTasks]);
  
  // Determine plan type: use hasParentPlan if provided, otherwise fall back to name matching
  const isDaily = hasParentPlan !== undefined 
    ? hasParentPlan 
    : (planTypeName || '').toLowerCase().includes('day');
  const isWeekly = hasParentPlan !== undefined 
    ? !hasParentPlan 
    : (planTypeName || '').toLowerCase().includes('week');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (isWeekly) {
        const selected = keyResults.find((k) => k.id === keyResultId);
        if (!selected) return;
        const res = await fetchWeeklyPlanSuggestions(selected.title);
        setItems(res.map((r) => ({ title: r.title, weight: r.weight, priority: r.priority, target: r.target })));
      } else if (isDaily) {
        // Get selected key result title
        const selectedKeyResult = keyResults.find((k) => k.id === keyResultId);
        if (!selectedKeyResult) return;
        
        // Get selected weekly plan task
        const selectedWeeklyTask = weeklyPlanTasks.find((t) => t.id === weeklyPlanTaskId);
        if (!selectedWeeklyTask) return;
        
        // Combine key result and weekly plan task as one string
        const combinedPrompt = `Key Result: ${selectedKeyResult.title}\nWeekly Plan: ${selectedWeeklyTask.task}`;
        
        const res = await fetchDailyPlanSuggestions(combinedPrompt);
        setItems(res.map((r) => ({ title: r.title, weight: r.weight, priority: r.priority })));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToForm = async (item: { title: string; weight: number; priority: string; target?: number }, index: number) => {
    const targetKeyResultId = keyResultId || keyResults[0]?.id;
    if (!targetKeyResultId) return;

    // For daily plans, we need to include the parentTaskId in the form field name
    let boardKey, listName;
    
    if (isDaily && weeklyPlanTaskId) {
      // Daily plan: use composite key with both keyResultId and parentTaskId
      const compositeKey = `${targetKeyResultId}${weeklyPlanTaskId}`;
      boardKey = resolveBoardKeyForKR ? resolveBoardKeyForKR(compositeKey) : compositeKey;
      listName = resolveListNameForKR ? resolveListNameForKR(compositeKey) : `names-${compositeKey}`;
    } else {
      // Weekly plan: use only keyResultId
      boardKey = resolveBoardKeyForKR ? resolveBoardKeyForKR(targetKeyResultId) : targetKeyResultId;
      listName = resolveListNameForKR ? resolveListNameForKR(targetKeyResultId) : `names-${targetKeyResultId}`;
    }

    // Create the board form if it doesn't exist
    const currentList = form.getFieldValue(listName) || [];
    if (currentList.length === 0) {
      handleAddBoard(boardKey);
    }

    // Prepare the task data with proper structure
    const taskData = {
      task: item.title,
      weight: item.weight,
      priority: (item.priority || 'medium').toLowerCase(),
      targetValue: typeof item.target === 'number' ? item.target : 0,
      achieveMK: false, // Set to false for regular tasks
      // For daily plans, include parentTaskId
      ...(isDaily && weeklyPlanTaskId && { parentTaskId: weeklyPlanTaskId }),
    };

    // Check if task already exists to prevent duplicates
    const existingList = form.getFieldValue(listName) || [];
    const taskExists = existingList.some((existingTask: any) => 
      existingTask.task === taskData.task && existingTask.weight === taskData.weight
    );

    if (taskExists) {
      // Task already exists, just remove from suggestions
      setItems(prev => prev.filter((_item, i) => i !== index));
      return;
    }

    // Use the same logic for both weekly and daily plans
    const boardFormKey = `board-${boardKey}`;
    const boardFormValues = form.getFieldValue(boardFormKey) || [];
    
    // Add the task data to the first position (index 0) in the board form
    boardFormValues[0] = taskData;
    form.setFieldsValue({ [boardFormKey]: boardFormValues });

    // Give the form a moment to update
    setTimeout(async () => {
      try {
        // Validate the board form fields
        await form.validateFields([[boardFormKey, 0, 'task'], [boardFormKey, 0, 'weight'], [boardFormKey, 0, 'priority']]);
        
        // Call handleAddName to save the task (this handles the names list and weight calculation)
        if (handleAddName) {
          handleAddName(taskData, boardKey);
        }
        
        // Clear the board form after adding
        form.setFieldsValue({ [boardFormKey]: [] });
      } catch (error) {
        // Validation failed - error is expected during form validation
      }
    }, 100);
    
    // Remove the suggestion from the list after successfully adding
    setItems(prev => prev.filter((_item, i) => i !== index));
  };

  return (
    <>
      <Button type="primary" ghost onClick={() => setOpen(true)}>
        AI Suggestion
      </Button>
      <Modal
        title={
          <div className="text-base font-semibold">AI Planning Suggestion</div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        {keyResults.length === 0 ? (
          <Empty 
            description={
              <div className="text-sm">
                {isDaily 
                  ? "No key results found. Please create a weekly plan with tasks first."
                  : "No key results found. Please create objectives with key results first."}
              </div>
            } 
          />
        ) : (
          <>
            <div className="mb-4">
              {isWeekly && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">Key Result</span>
                  <Select
                    className="w-full"
                    placeholder="Choose a key result"
                    options={keyResults.map((k) => ({ label: k.title, value: k.id }))}
                    value={keyResultId}
                    onChange={setKeyResultId}
                  />
                  <Button 
                    loading={loading} 
                    type="primary" 
                    onClick={handleGenerate}
                  >
                    {items.length ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
              )}
              {isDaily && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24">Key Result</span>
                    <Select
                      className="flex-1"
                      placeholder="Choose a key result to attach tasks"
                      options={keyResults.map((k) => ({ label: k.title, value: k.id }))}
                      value={keyResultId}
                      onChange={setKeyResultId}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24">Weekly Plan</span>
                    <Select
                      className="flex-1"
                      placeholder="Select a weekly plan task"
                      options={weeklyPlanTasks.map((t) => ({ label: t.task, value: t.id }))}
                      value={weeklyPlanTaskId}
                      onChange={setWeeklyPlanTaskId}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      loading={loading} 
                      type="primary" 
                      onClick={handleGenerate}
                      disabled={!keyResultId || !weeklyPlanTaskId}
                    >
                      {items.length ? 'Regenerate' : 'Generate'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {items.length === 0 && (
                <Empty description={<span className="text-xs">No suggestions yet</span>} />
              )}
              {items.map((s, idx) => (
                <div key={idx} className="border rounded-lg p-3 flex justify-between items-start">
                  <div>
                    <Typography.Text className="text-sm">{s.title}</Typography.Text>
                    <div className="mt-2 flex gap-2">
                      {typeof s.weight === 'number' && <Tag>Weight: {s.weight}</Tag>}
                      {s.priority && <Tag>Priority: {s.priority}</Tag>}
                      {typeof s.target === 'number' && <Tag>Target: {s.target}</Tag>}
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={() => addToForm(s, idx)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default AISuggestionsModal;


