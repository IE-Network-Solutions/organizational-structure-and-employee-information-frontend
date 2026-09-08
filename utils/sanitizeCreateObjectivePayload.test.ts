import { sanitizeCreateObjectivePayload } from '@/utils/sanitizeCreateObjectivePayload';

describe('sanitizeCreateObjectivePayload', () => {
  it('omits empty alignment and other blank uuid fields', () => {
    const payload = sanitizeCreateObjectivePayload(
      {
        title: 'TEST',
        userId: '57577865-7625-4170-a803-a73567e19216',
        deadline: '2026-09-30',
        allignedKeyResultId: '',
        sessionId: '',
        keyResults: [
          {
            id: '',
            title: 'Test 1',
            weight: 100,
            metricTypeId: '',
            sessionId: '',
            deadline: '2026-09-30',
            initialValue: 0,
            targetValue: 100,
            key_type: 'Percentage',
            metricType: { name: 'Percentage' },
            isAISuggestion: true,
          },
        ],
      },
      '57577865-7625-4170-a803-a73567e19216',
    );

    expect(payload).not.toHaveProperty('allignedKeyResultId');
    expect(payload).not.toHaveProperty('sessionId');
    expect(payload.keyResults[0]).not.toHaveProperty('metricTypeId');
    expect(payload.keyResults[0]).not.toHaveProperty('id');
    expect(payload.keyResults[0]).not.toHaveProperty('key_type');
    expect(payload.keyResults[0]).not.toHaveProperty('metricType');
    expect(payload.keyResults[0].title).toBe('Test 1');
  });

  it('keeps a valid alignment uuid', () => {
    const aligned = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const payload = sanitizeCreateObjectivePayload({
      title: 'TEST',
      userId: '57577865-7625-4170-a803-a73567e19216',
      deadline: '2026-09-30',
      allignedKeyResultId: aligned,
      keyResults: [],
    });
    expect(payload.allignedKeyResultId).toBe(aligned);
  });
});
