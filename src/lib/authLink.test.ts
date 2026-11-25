/** Tests for parseAuthLink and newPasswordProblem. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPasswordProblem, parseAuthLink } from './authLink';

test('reads the session from a password reset or invitation link', () => {
  for (const type of ['recovery', 'invite']) {
    assert.deepEqual(parseAuthLink(`#access_token=aaa&expires_in=3600&refresh_token=rrr&token_type=bearer&type=${type}`), {
      kind: 'setPassword',
      accessToken: 'aaa',
      refreshToken: 'rrr',
    });
  }
});

test('reports expired and other failed links', () => {
  assert.deepEqual(parseAuthLink('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'), {
    kind: 'error',
    message: 'Linkul a expirat sau a fost deja folosit. Cere unul nou.',
  });
  assert.deepEqual(parseAuthLink('#error=server_error&error_description=Something+broke'), { kind: 'error', message: 'Something broke' });
});

test('ignores section anchors, old hash routes, other link types and partial tokens', () => {
  for (const hash of ['', '#status', '#/noutati', '#access_token=a&refresh_token=r&type=magiclink', '#access_token=a&type=recovery']) {
    assert.equal(parseAuthLink(hash), null, hash);
  }
});

test('new passwords need 8 characters and a matching confirmation', () => {
  assert.equal(newPasswordProblem('short', 'short'), 'Parola trebuie să aibă cel puțin 8 caractere.');
  assert.equal(newPasswordProblem('long-enough', 'different'), 'Parolele nu coincid.');
  assert.equal(newPasswordProblem('long-enough', 'long-enough'), null);
});
