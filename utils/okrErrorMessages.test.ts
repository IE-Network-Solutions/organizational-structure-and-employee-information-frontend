import { getFriendlyOkrError } from './okrErrorMessages';

const backendError = (message: string | string[]) => ({
  response: { data: { statusCode: 400, message, error: 'Bad Request' } },
});

describe('getFriendlyOkrError', () => {
  it('explains the missing tenant default weights and points to the weights screen', () => {
    const result = getFriendlyOkrError(
      backendError(
        'Tenant default objective type weights must be configured before enabling TYPE_WEIGHTED scoring mode',
      ),
    );

    expect(result.message).not.toMatch(
      /TYPE_WEIGHTED|tenant default objective/,
    );
    expect(result.message).toMatch(/add up to 100%/);
    expect(result.fixPath).toBe('/okr/settings/objective-type-weights');
    expect(result.fixLabel).toBe('Set type weights');
  });

  it('explains why the tenant default cannot be deleted', () => {
    const result = getFriendlyOkrError(
      backendError(
        'The tenant default weights cannot be deleted while Type-weighted scoring is on. Switch to Classic average first, or replace the weights instead.',
      ),
    );

    expect(result.message).toMatch(/Edit them instead of deleting/);
    expect(result.fixPath).toBeUndefined();
  });

  it('keeps unknown backend messages unchanged', () => {
    expect(
      getFriendlyOkrError(backendError('Something specific')).message,
    ).toBe('Something specific');
  });

  it('joins validation message arrays', () => {
    expect(getFriendlyOkrError(backendError(['a', 'b'])).message).toBe('a, b');
  });

  it('falls back to the error message, then to the default', () => {
    expect(getFriendlyOkrError(new Error('Network Error')).message).toBe(
      'Network Error',
    );
    expect(getFriendlyOkrError({}, 'Try again').message).toBe('Try again');
  });
});
