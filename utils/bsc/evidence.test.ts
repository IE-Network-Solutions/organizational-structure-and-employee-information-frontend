import { hasEvidenceArtifact } from './evidence';

describe('hasEvidenceArtifact', () => {
  it('accepts a URL, file name, or hash', () => {
    expect(hasEvidenceArtifact({ evidenceUrl: 'https://files/a.pdf' })).toBe(
      true,
    );
    expect(hasEvidenceArtifact({ evidenceFileName: 'a.pdf' })).toBe(true);
    expect(hasEvidenceArtifact({ evidenceHash: 'abc123' })).toBe(true);
  });

  it('rejects missing or blank artifacts', () => {
    expect(hasEvidenceArtifact({})).toBe(false);
    expect(hasEvidenceArtifact({ evidenceUrl: '  ' })).toBe(false);
    expect(
      hasEvidenceArtifact({
        evidenceUrl: '',
        evidenceFileName: null,
        evidenceHash: undefined,
      }),
    ).toBe(false);
  });
});
