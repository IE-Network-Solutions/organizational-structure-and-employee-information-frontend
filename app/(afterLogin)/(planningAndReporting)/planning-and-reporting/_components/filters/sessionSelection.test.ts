import { describe, expect, it } from '@jest/globals';
import { reconcileSelectedSessionIds } from './sessionSelection';

describe('reconcileSelectedSessionIds', () => {
  it('keeps only sessions that belong to the selected fiscal year', () => {
    expect(reconcileSelectedSessionIds(['s-1', 's-2'], ['s-2', 's-3'])).toEqual(
      ['s-2'],
    );
  });

  it('returns an empty array when nothing is selected', () => {
    expect(reconcileSelectedSessionIds([], ['s-2', 's-3'])).toEqual([]);
  });

  it('drops stale sessions when the fiscal year changes', () => {
    expect(reconcileSelectedSessionIds(['legacy-session'], ['s-1'])).toEqual(
      [],
    );
  });
});
