/** Tests for youtubeVideoId and youtubeEmbedUrl. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeEmbedUrl, youtubeVideoId } from './youtube';

test('finds the id in every common YouTube URL shape', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=VQRLujxTm3c',
    'https://youtube.com/watch?v=VQRLujxTm3c&t=42s',
    'https://m.youtube.com/watch?v=VQRLujxTm3c',
    'https://youtu.be/VQRLujxTm3c?si=abc',
    'https://www.youtube.com/shorts/VQRLujxTm3c',
    'https://www.youtube.com/embed/VQRLujxTm3c',
    'https://www.youtube.com/live/VQRLujxTm3c',
  ]) {
    assert.equal(youtubeVideoId(url), 'VQRLujxTm3c', url);
  }
});

test('rejects other sites, channels, malformed ids and junk', () => {
  for (const url of [
    null,
    '',
    'not a url',
    'https://www.reddit.com/r/GTA6/',
    'https://www.youtube.com/@RockstarGames',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/watch?v=VQRLujxTm3c"onload=x',
    'https://evil.example/watch?v=VQRLujxTm3c',
    'https://youtube.com.evil.example/watch?v=VQRLujxTm3c',
  ]) {
    assert.equal(youtubeVideoId(url), null, String(url));
  }
});

test('builds the privacy-enhanced autoplaying player address', () => {
  assert.equal(youtubeEmbedUrl('VQRLujxTm3c'), 'https://www.youtube-nocookie.com/embed/VQRLujxTm3c?autoplay=1&rel=0');
});
