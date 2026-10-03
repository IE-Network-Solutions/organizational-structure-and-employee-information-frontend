import { calculateTotalWeight } from './weightUtils';

describe('calculateTotalWeight', () => {
  it('adds objective type weights and treats empty inputs as zero', () => {
    expect(calculateTotalWeight([25, undefined, 75])).toBe(100);
  });
});
