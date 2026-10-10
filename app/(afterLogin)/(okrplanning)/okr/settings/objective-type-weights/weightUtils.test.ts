import {
  calculateTotalWeight,
  distributeEvenly,
  roundWeight,
} from './weightUtils';

describe('calculateTotalWeight', () => {
  it('adds objective type weights and treats empty inputs as zero', () => {
    expect(calculateTotalWeight([25, undefined, 75])).toBe(100);
  });
});

describe('roundWeight', () => {
  it('removes floating point noise', () => {
    expect(roundWeight(0.1 + 0.2)).toBe(0.3);
    expect(roundWeight(33.33 + 33.33 + 33.34)).toBe(100);
  });
});

describe('distributeEvenly', () => {
  it('returns an empty list for no items', () => {
    expect(distributeEvenly(0)).toEqual([]);
  });

  it('splits evenly when divisible', () => {
    expect(distributeEvenly(4)).toEqual([25, 25, 25, 25]);
  });

  it('puts the remainder on the last item so the total is exactly 100', () => {
    const shares = distributeEvenly(3);
    expect(shares).toEqual([33.33, 33.33, 33.34]);
    expect(roundWeight(calculateTotalWeight(shares))).toBe(100);
  });
});
