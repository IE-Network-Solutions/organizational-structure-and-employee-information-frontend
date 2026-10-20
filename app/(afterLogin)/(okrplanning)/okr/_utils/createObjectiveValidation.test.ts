import { getObjectiveKeyResultsValidationError } from './createObjectiveValidation';

const keyResultOf = (overrides: Record<string, unknown> = {}) => ({
  title: 'Increase revenue',
  deadline: '2026-12-31',
  weight: 100,
  key_type: 'Numeric',
  initialValue: 0,
  thresholdValue: 50,
  targetValue: 100,
  stretchValue: 120,
  ...overrides,
});

describe('Create Objective readiness', () => {
  it.each(['Numeric', 'Currency', 'Percentage'])(
    'blocks incomplete %s key results and accepts a zero baseline',
    (keyType) => {
      for (const field of [
        'initialValue',
        'thresholdValue',
        'targetValue',
        'stretchValue',
      ]) {
        for (const missing of [undefined, null, '', '  ']) {
          expect(
            getObjectiveKeyResultsValidationError(
              [keyResultOf({ key_type: keyType, [field]: missing })],
              'TYPE_WEIGHTED',
            ),
          ).not.toBeNull();
        }
      }
      expect(
        getObjectiveKeyResultsValidationError(
          [keyResultOf({ key_type: keyType })],
          'TYPE_WEIGHTED',
        ),
      ).toBeNull();
    },
  );

  it('requires every key result to be complete, including a second result', () => {
    const first = keyResultOf({ weight: 50 });
    const second = keyResultOf({ weight: 50, stretchValue: undefined });
    expect(
      getObjectiveKeyResultsValidationError([first, second], 'TYPE_WEIGHTED'),
    ).toBe('Key result 2: Please enter the Stretch.');
    expect(
      getObjectiveKeyResultsValidationError(
        [first, { ...second, stretchValue: 120 }],
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
  });

  it('blocks submission again when a previously completed field is cleared', () => {
    const completed = keyResultOf();
    expect(
      getObjectiveKeyResultsValidationError([completed], 'TYPE_WEIGHTED'),
    ).toBeNull();
    expect(
      getObjectiveKeyResultsValidationError(
        [{ ...completed, initialValue: null }],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/baseline/i);
  });

  it('requires a non-empty key result name, deadline, and weight', () => {
    for (const field of ['title', 'deadline', 'weight']) {
      for (const missing of [undefined, null, '', '  ']) {
        expect(
          getObjectiveKeyResultsValidationError(
            [keyResultOf({ [field]: missing })],
            'TYPE_WEIGHTED',
          ),
        ).not.toBeNull();
      }
    }
  });

  it('does not require threshold or stretch for classic scoring', () => {
    expect(
      getObjectiveKeyResultsValidationError(
        [keyResultOf({ thresholdValue: undefined, stretchValue: undefined })],
        'CLASSIC_AVERAGE',
      ),
    ).toBeNull();
  });

  it('blocks invalid band ordering as well as missing bands', () => {
    expect(
      getObjectiveKeyResultsValidationError(
        [keyResultOf({ stretchValue: 90 })],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/stretch.*target/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [keyResultOf({ targetValue: 0 })],
        'CLASSIC_AVERAGE',
      ),
    ).toMatch(/target.*baseline/i);
  });

  it('does not require numeric fields on achieved or milestone key results', () => {
    const common = { title: 'Launch', deadline: '2026-12-31', weight: 100 };
    expect(
      getObjectiveKeyResultsValidationError(
        [{ ...common, key_type: 'Achieved' }],
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
    expect(
      getObjectiveKeyResultsValidationError(
        [
          {
            ...common,
            key_type: 'Milestone',
            milestones: [{ title: 'Go live', weight: 100 }],
          },
        ],
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
  });

  it('keeps incomplete milestones and incorrect milestone totals from enabling Create', () => {
    const milestone = keyResultOf({ key_type: 'Milestone', milestones: [] });
    expect(
      getObjectiveKeyResultsValidationError([milestone], 'TYPE_WEIGHTED'),
    ).toMatch(/add at least one milestone/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [
          keyResultOf({
            key_type: 'Milestone',
            milestones: [{ title: ' ', weight: 100 }],
          }),
        ],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/name for milestone/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [
          keyResultOf({
            key_type: 'Milestone',
            milestones: [{ title: 'Go live', weight: null }],
          }),
        ],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/weight/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [
          keyResultOf({
            key_type: 'Milestone',
            milestones: [{ title: 'Go live', weight: 50 }],
          }),
        ],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/milestone weights must total 100/i);
  });

  it('requires at least one key result and a total weight of 100%', () => {
    expect(
      getObjectiveKeyResultsValidationError([], 'TYPE_WEIGHTED'),
    ).not.toBeNull();
    expect(
      getObjectiveKeyResultsValidationError(
        [keyResultOf({ weight: 90 })],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/weights must total 100/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [keyResultOf({ weight: 110 })],
        'TYPE_WEIGHTED',
      ),
    ).not.toBeNull();
  });

  it('recognizes metric types returned by the API and numeric string values', () => {
    expect(
      getObjectiveKeyResultsValidationError(
        [
          keyResultOf({
            key_type: '',
            metricType: { name: 'Currency' },
            targetValue: '',
          }),
        ],
        'TYPE_WEIGHTED',
      ),
    ).toMatch(/target/i);
    expect(
      getObjectiveKeyResultsValidationError(
        [
          keyResultOf({
            weight: '100',
            initialValue: '0',
            thresholdValue: '50',
            targetValue: '100',
            stretchValue: '120',
          }),
        ],
        'TYPE_WEIGHTED',
      ),
    ).toBeNull();
  });
});
