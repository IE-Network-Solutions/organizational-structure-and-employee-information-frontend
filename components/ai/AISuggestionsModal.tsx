import React, { useMemo, useState } from 'react';
import { Button, Modal, Select, Typography, Tag, Input, Empty } from 'antd';
import { fetchWeeklyPlanSuggestions, fetchDailyPlanSuggestions } from '@/utils/aiService';

type KeyResultOption = { id: string; title: string };

interface AISuggestionsModalProps {
  getKeyResults: () => KeyResultOption[];
  form: any;
  handleAddBoard: (key: string) => void;
  handleAddName?: (values: Record<string, any>, key: string) => void; // Function to save the task
  planTypeName?: string; // 'Weekly' | 'Daily' | others
  resolveListNameForKR?: (krId: string) => string; // returns form list name e.g., names-<id or composite>
  resolveBoardKeyForKR?: (krId: string) => string; // what to pass to handleAddBoard
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  getKeyResults,
  form,
  handleAddBoard,
  handleAddName,
  planTypeName,
  resolveListNameForKR,
  resolveBoardKeyForKR,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyResultId, setKeyResultId] = useState<string | undefined>();
  const [weeklyPlanText, setWeeklyPlanText] = useState('');
  const [items, setItems] = useState<
    { title: string; weight: number; priority: string; target?: number }[]
  >([]);

  const keyResults = useMemo(() => getKeyResults(), [getKeyResults]);
  const isWeekly = (planTypeName || '').toLowerCase().includes('week');
  const isDaily = (planTypeName || '').toLowerCase().includes('day');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (isWeekly) {
        const selected = keyResults.find((k) => k.id === keyResultId);
        if (!selected) return;
        const res = await fetchWeeklyPlanSuggestions(selected.title);
        setItems(res.map((r) => ({ title: r.title, weight: r.weight, priority: r.priority, target: r.target })));
      } else if (isDaily) {
        if (!weeklyPlanText) return;
        const res = await fetchDailyPlanSuggestions(weeklyPlanText);
        setItems(res.map((r) => ({ title: r.title, weight: r.weight, priority: r.priority })));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToForm = async (item: { title: string; weight: number; priority: string; target?: number }, index: number) => {
    const targetKeyResultId = keyResultId || keyResults[0]?.id;
    if (!targetKeyResultId) return;

    const boardKey = resolveBoardKeyForKR
      ? resolveBoardKeyForKR(targetKeyResultId)
      : targetKeyResultId;
    
    const listName = resolveListNameForKR
      ? resolveListNameForKR(targetKeyResultId)
      : `names-${targetKeyResultId}`;

    // Create the board form if it doesn't exist
    const currentList = form.getFieldValue(listName) || [];
    if (currentList.length === 0) {
      handleAddBoard(boardKey);
    }

    // Prepare the task data
    const taskData = {
      task: item.title,
      weight: item.weight,
      priority: (item.priority || 'medium').toLowerCase(),
      targetValue: typeof item.target === 'number' ? item.target : undefined,
    };

    // Set the values in the board form
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
        
        // If handleAddName is provided, call it to save the task
        if (handleAddName) {
          handleAddName(taskData, boardKey);
          
          // Clear the board form
          form.setFieldsValue({ [boardFormKey]: [] });
        } else {
          // Fallback: just add to the names list
          const newList = [...(form.getFieldValue(listName) || [])];
          const indexToFill = newList.findIndex((i: any) => !i || Object.keys(i).length === 0);
          const putIndex = indexToFill >= 0 ? indexToFill : newList.length;
          newList[putIndex] = taskData;
          form.setFieldsValue({ [listName]: newList });
        }
        
        // Remove the suggestion from the list after successfully adding
        setItems(prev => prev.filter((_item, i) => i !== index));
      } catch (error) {
        // Validation failed - error is expected during form validation
      }
    }, 100);
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
              <Button loading={loading} type="primary" onClick={handleGenerate}>
                {items.length ? 'Regenerate' : 'Generate'}
              </Button>
            </div>
          )}
          {isDaily && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm">Key Result</span>
                <Select
                  className="w-full"
                  placeholder="Choose a key result to attach tasks"
                  options={keyResults.map((k) => ({ label: k.title, value: k.id }))}
                  value={keyResultId}
                  onChange={setKeyResultId}
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm mt-1">Weekly Plan</span>
                <Input.TextArea
                  placeholder="e.g. Finalize 20% ETL pipeline"
                  value={weeklyPlanText}
                  onChange={(e) => setWeeklyPlanText(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
                <Button loading={loading} type="primary" onClick={handleGenerate}>
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
              <Button type="primary" onClick={() => addToForm(s, idx)}>Add</Button>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default AISuggestionsModal;


