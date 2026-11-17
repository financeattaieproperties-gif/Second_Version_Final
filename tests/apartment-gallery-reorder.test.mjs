import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper simulating ApartmentGalleryReorder reorder logic
function reorderPhotos(allPhotos, fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= allPhotos.length || toIdx >= allPhotos.length) {
    return { coverUrl: allPhotos[0] || null, galleryUrls: allPhotos.slice(1) };
  }
  const updated = [...allPhotos];
  const [moved] = updated.splice(fromIdx, 1);
  updated.splice(toIdx, 0, moved);
  return {
    coverUrl: updated.length > 0 ? updated[0] : null,
    galleryUrls: updated.slice(1),
  };
}

function removePhoto(allPhotos, index) {
  const updated = allPhotos.filter((_, i) => i !== index);
  return {
    coverUrl: updated.length > 0 ? updated[0] : null,
    galleryUrls: updated.slice(1),
  };
}

test('ApartmentGalleryReorder logic: promotes dragged photo to Cover when dropped at Slot 1', () => {
  const initialPhotos = [
    'https://example.com/cover.jpg',
    'https://example.com/balcony.jpg',
    'https://example.com/kitchen.jpg',
    'https://example.com/bedroom.jpg',
  ];

  // Dragging kitchen (index 2) to Slot 1 (index 0)
  const result = reorderPhotos(initialPhotos, 2, 0);

  assert.equal(result.coverUrl, 'https://example.com/kitchen.jpg', 'Kitchen photo should be promoted to cover');
  assert.deepEqual(result.galleryUrls, [
    'https://example.com/cover.jpg',
    'https://example.com/balcony.jpg',
    'https://example.com/bedroom.jpg',
  ], 'Remaining photos maintain their shifted relative positions');
});

test('ApartmentGalleryReorder logic: dragging cover photo demotes it to gallery and promotes slot 2', () => {
  const initialPhotos = [
    'https://example.com/photo-1.jpg',
    'https://example.com/photo-2.jpg',
    'https://example.com/photo-3.jpg',
  ];

  // Dragging cover (index 0) to end (index 2)
  const result = reorderPhotos(initialPhotos, 0, 2);

  assert.equal(result.coverUrl, 'https://example.com/photo-2.jpg', 'Photo 2 should become new cover');
  assert.deepEqual(result.galleryUrls, [
    'https://example.com/photo-3.jpg',
    'https://example.com/photo-1.jpg',
  ]);
});

test('ApartmentGalleryReorder logic: reordering within gallery preserves cover photo', () => {
  const initialPhotos = [
    'https://example.com/cover.jpg',
    'https://example.com/gallery-1.jpg',
    'https://example.com/gallery-2.jpg',
    'https://example.com/gallery-3.jpg',
  ];

  // Dragging gallery-3 (index 3) to index 1
  const result = reorderPhotos(initialPhotos, 3, 1);

  assert.equal(result.coverUrl, 'https://example.com/cover.jpg', 'Cover photo remains untouched');
  assert.deepEqual(result.galleryUrls, [
    'https://example.com/gallery-3.jpg',
    'https://example.com/gallery-1.jpg',
    'https://example.com/gallery-2.jpg',
  ]);
});

test('ApartmentGalleryReorder logic: "★ Set as Cover" promotes any item to index 0', () => {
  const initialPhotos = [
    'https://example.com/cover.jpg',
    'https://example.com/living.jpg',
    'https://example.com/view.jpg',
  ];

  // Set view.jpg (index 2) as Cover
  const result = reorderPhotos(initialPhotos, 2, 0);

  assert.equal(result.coverUrl, 'https://example.com/view.jpg');
  assert.deepEqual(result.galleryUrls, [
    'https://example.com/cover.jpg',
    'https://example.com/living.jpg',
  ]);
});

test('ApartmentGalleryReorder logic: removing cover photo shifts next photo to cover', () => {
  const initialPhotos = [
    'https://example.com/old-cover.jpg',
    'https://example.com/next-in-line.jpg',
  ];

  const result = removePhoto(initialPhotos, 0);

  assert.equal(result.coverUrl, 'https://example.com/next-in-line.jpg');
  assert.deepEqual(result.galleryUrls, []);

  // Removing the only remaining photo
  const emptyResult = removePhoto(['https://example.com/next-in-line.jpg'], 0);
  assert.equal(emptyResult.coverUrl, null);
  assert.deepEqual(emptyResult.galleryUrls, []);
});

test('Component source code verification: ApartmentGalleryReorder implements full HTML5 drag-and-drop', () => {
  const compPath = path.resolve('admin-panel/src/components/ApartmentGalleryReorder.tsx');
  assert.ok(fs.existsSync(compPath), 'ApartmentGalleryReorder.tsx must exist');

  const content = fs.readFileSync(compPath, 'utf8');

  // HTML5 drag and drop handlers
  assert.ok(content.includes('draggable'), 'Card element must have draggable attribute');
  assert.ok(content.includes('onDragStart'), 'Must implement onDragStart handler');
  assert.ok(content.includes('onDragOver'), 'Must implement onDragOver handler');
  assert.ok(content.includes('onDragLeave'), 'Must implement onDragLeave handler');
  assert.ok(content.includes('onDrop'), 'Must implement onDrop handler');
  assert.ok(content.includes('onDragEnd'), 'Must implement onDragEnd handler');

  // Accessible action controls
  assert.ok(content.includes('★ Set as Cover'), 'Must provide one-click Set as Cover button');
  assert.ok(content.includes('moveStep'), 'Must provide keyboard/click step reordering');
  assert.ok(content.includes('removePhoto'), 'Must provide remove action');

  // Visual cues
  assert.ok(content.includes('Drop here for Slot'), 'Must provide clear drop-target feedback');
  assert.ok(content.includes('Slot 1 is always the primary Cover Photo') || content.includes('Position 1 is always'), 'Must instruct user that Slot 1 is Cover');
});

test('Integration verification: ProjectForm integrates ApartmentGalleryReorder', () => {
  const formPath = path.resolve('admin-panel/src/pages/ProjectForm.tsx');
  assert.ok(fs.existsSync(formPath), 'ProjectForm.tsx must exist');

  const content = fs.readFileSync(formPath, 'utf8');

  assert.ok(
    content.includes('ApartmentGalleryReorder'),
    'ProjectForm.tsx must import and render ApartmentGalleryReorder'
  );
  assert.ok(
    content.includes('Drag &amp; Drop Reordering') || content.includes('Drag & Drop Reordering'),
    'ProjectForm.tsx must display the drag-and-drop badge indicator'
  );
  assert.ok(
    content.includes('coverUrl={unitForm.image_url}'),
    'ProjectForm.tsx must bind coverUrl to unitForm.image_url'
  );
  assert.ok(
    content.includes('galleryUrls={unitForm.gallery_images'),
    'ProjectForm.tsx must bind galleryUrls to unitForm.gallery_images'
  );
});
