import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Verify regex and parsing logic
function parseVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch) {
    const id = ytMatch[1];
    const timeMatch = trimmed.match(/[?&](?:t|start)=(\d+)/);
    const start = timeMatch ? timeMatch[1] : null;
    const startParam = start ? `&start=${start}` : '';

    return {
      provider: 'youtube',
      id,
      start,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${startParam}`,
      externalUrl: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`,
      defaultPoster: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      providerLabel: 'YouTube HD Walkthrough',
    };
  }

  const vmMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)(?:\/([a-zA-Z0-9]+))?|player\.vimeo\.com\/video\/(\d+)(?:\?h=([a-zA-Z0-9]+))?)/
  );
  if (vmMatch) {
    const id = vmMatch[1] || vmMatch[3];
    const hash = vmMatch[2] || vmMatch[4] || null;
    const hashParam = hash ? `&h=${hash}` : '';

    return {
      provider: 'vimeo',
      id,
      hash,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&badge=0&dnt=1${hashParam}`,
      externalUrl: hash ? `https://vimeo.com/${id}/${hash}` : `https://vimeo.com/${id}`,
      defaultPoster: undefined,
      providerLabel: 'Vimeo Cinematic Tour',
    };
  }

  return {
    provider: 'direct',
    embedUrl: trimmed,
    externalUrl: trimmed,
    providerLabel: 'HD Video Tour',
  };
}

test('ApartmentWalkthroughVideo supports YouTube URLs (standard, shorts, embed, timestamp)', () => {
  const watchUrl = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(watchUrl?.provider, 'youtube');
  assert.equal(watchUrl?.id, 'dQw4w9WgXcQ');
  assert.ok(watchUrl?.embedUrl.includes('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
  assert.equal(watchUrl?.defaultPoster, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');

  const shortUrl = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ?t=90');
  assert.equal(shortUrl?.provider, 'youtube');
  assert.equal(shortUrl?.id, 'dQw4w9WgXcQ');
  assert.equal(shortUrl?.start, '90');
  assert.ok(shortUrl?.embedUrl.includes('&start=90'));
  assert.ok(shortUrl?.externalUrl.includes('&t=90s'));

  const shortsUrl = parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(shortsUrl?.provider, 'youtube');
  assert.equal(shortsUrl?.id, 'dQw4w9WgXcQ');
});

test('ApartmentWalkthroughVideo supports Vimeo URLs (standard, unlisted hash, player embed)', () => {
  const standardVimeo = parseVideoUrl('https://vimeo.com/76979871');
  assert.equal(standardVimeo?.provider, 'vimeo');
  assert.equal(standardVimeo?.id, '76979871');
  assert.equal(
    standardVimeo?.embedUrl,
    'https://player.vimeo.com/video/76979871?autoplay=1&title=0&byline=0&portrait=0&badge=0&dnt=1'
  );

  const unlistedVimeo = parseVideoUrl('https://vimeo.com/76979871/9a8b7c6d5e');
  assert.equal(unlistedVimeo?.provider, 'vimeo');
  assert.equal(unlistedVimeo?.id, '76979871');
  assert.equal(unlistedVimeo?.hash, '9a8b7c6d5e');
  assert.ok(unlistedVimeo?.embedUrl.includes('&h=9a8b7c6d5e'));

  const playerVimeo = parseVideoUrl('https://player.vimeo.com/video/76979871?h=fedcba0987');
  assert.equal(playerVimeo?.provider, 'vimeo');
  assert.equal(playerVimeo?.id, '76979871');
  assert.equal(playerVimeo?.hash, 'fedcba0987');
  assert.ok(playerVimeo?.embedUrl.includes('&h=fedcba0987'));
});

test('ApartmentWalkthroughVideo supports direct MP4 videos and rejects empty inputs', () => {
  const direct = parseVideoUrl('https://storage.attaieproperties.com/walkthrough.mp4');
  assert.equal(direct?.provider, 'direct');
  assert.equal(direct?.embedUrl, 'https://storage.attaieproperties.com/walkthrough.mp4');

  assert.equal(parseVideoUrl(''), null);
  assert.equal(parseVideoUrl('   '), null);
  assert.equal(parseVideoUrl(null), null);
});

test('PropertyDetailPage integrates ApartmentWalkthroughVideo with poster and unit metadata', () => {
  const propertyDetailSource = fs.readFileSync(
    new URL('../src/pages/PropertyDetailPage.tsx', import.meta.url),
    'utf8'
  );

  assert.ok(
    propertyDetailSource.includes('ApartmentWalkthroughVideo'),
    'Expected ApartmentWalkthroughVideo in PropertyDetailPage.tsx'
  );
  assert.ok(
    propertyDetailSource.includes('Apartment &amp; Interior Video Walkthrough'),
    'Expected Video Walkthrough section title in PropertyDetailPage.tsx'
  );
  assert.ok(
    propertyDetailSource.includes('posterUrl='),
    'Expected posterUrl prop passed to ApartmentWalkthroughVideo'
  );
});

test('ProjectDetailPage integrates ApartmentWalkthroughVideo for development walkthroughs', () => {
  const projectDetailSource = fs.readFileSync(
    new URL('../src/pages/ProjectDetailPage.tsx', import.meta.url),
    'utf8'
  );

  assert.ok(
    projectDetailSource.includes('ApartmentWalkthroughVideo'),
    'Expected ApartmentWalkthroughVideo in ProjectDetailPage.tsx'
  );
  assert.ok(
    projectDetailSource.includes('Development &amp; Apartment Interior Walkthrough'),
    'Expected Walkthrough section in ProjectDetailPage.tsx'
  );
  assert.ok(
    projectDetailSource.includes('project.video_url'),
    'Expected project.video_url guard in ProjectDetailPage.tsx'
  );
});

test('ProjectUnitsSection modal integrates walkthrough video with custom title and compact mode', () => {
  const unitsSectionSource = fs.readFileSync(
    new URL('../src/components/project/ProjectUnitsSection.tsx', import.meta.url),
    'utf8'
  );

  assert.ok(
    unitsSectionSource.includes('VideoPlayer'),
    'Expected VideoPlayer in ProjectUnitsSection.tsx'
  );
  assert.ok(
    unitsSectionSource.includes('Interior Video Walkthrough & Tour'),
    'Expected Interior Video Walkthrough & Tour title in ProjectUnitsSection.tsx'
  );
});
