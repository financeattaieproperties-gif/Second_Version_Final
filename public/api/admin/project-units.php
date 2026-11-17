<?php
require_once __DIR__ . '/../bootstrap.php';
cors();
require_admin();

$db = db();
$method = $_SERVER['REQUEST_METHOD'];
$allowed = ['available', 'reserved', 'sold', 'rented'];

function decode_gallery(?string $raw): array {
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? array_values(array_filter($decoded)) : [];
}

function normalize_unit_output(array $row): array {
    $row['id']         = (int) $row['id'];
    $row['project_id'] = (int) $row['project_id'];
    $row['beds']       = $row['beds']  !== null ? (int) $row['beds']   : null;
    $row['baths']      = $row['baths'] !== null ? (int) $row['baths']  : null;
    $row['area']       = $row['area']  !== null ? (float) $row['area'] : null;
    $row['floor']      = $row['floor'] !== null ? (int) $row['floor']  : null;
    $row['price']      = $row['price'] !== null ? (float) $row['price']: null;

    $gallery = decode_gallery($row['gallery_images'] ?? null);
    $video = !empty($row['video_url']) ? (string) $row['video_url'] : null;
    $techPlan = !empty($row['technical_plan_url']) ? (string) $row['technical_plan_url'] : null;
    $desc = (string) ($row['description'] ?? '');

    // Extract tags from description if present
    if (strpos($desc, '[TECHNICAL_PLAN:') !== false) {
        if (preg_match('/\[TECHNICAL_PLAN:\s*([^\]]+)\]/', $desc, $m)) {
            if (!$techPlan) $techPlan = trim($m[1]);
            $desc = trim(preg_replace('/\[TECHNICAL_PLAN:\s*[^\]]+\]/', '', $desc));
        }
    }
    if (strpos($desc, '[GALLERY:') !== false) {
        if (preg_match('/\[GALLERY:\s*(\[[^\]]*\])\]/', $desc, $m)) {
            $parsed = json_decode($m[1], true);
            if (is_array($parsed) && empty($gallery)) $gallery = array_values(array_filter($parsed));
            $desc = trim(preg_replace('/\[GALLERY:\s*\[[^\]]*\]\]/', '', $desc));
        }
    }
    if (strpos($desc, '[VIDEO:') !== false) {
        if (preg_match('/\[VIDEO:\s*([^\]]+)\]/', $desc, $m)) {
            if (!$video) $video = trim($m[1]);
            $desc = trim(preg_replace('/\[VIDEO:\s*[^\]]+\]/', '', $desc));
        }
    }

    $row['description']        = $desc !== '' ? $desc : null;
    $row['gallery_images']     = $gallery;
    $row['video_url']          = $video;
    $row['technical_plan_url'] = $techPlan;
    return $row;
}

if ($method === 'GET') {
    $projectId = intval($_GET['project_id'] ?? 0);
    if (!$projectId) json_out(['error' => 'project_id required'], 400);
    $stmt = $db->prepare('SELECT * FROM project_units WHERE project_id = ? ORDER BY floor ASC, unit_number ASC');
    $stmt->bind_param('i', $projectId);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = normalize_unit_output($row);
    }
    json_out($rows);
}

$body = body();
if ($method === 'POST' || $method === 'PUT') {
    $id        = intval($body['id'] ?? 0);
    $projectId = intval($body['project_id'] ?? 0);
    $unit      = trim((string) ($body['unit_number'] ?? ''));
    $status    = trim((string) ($body['status'] ?? 'available'));
    if (!$projectId || $unit === '' || !in_array($status, $allowed, true)) {
        json_out(['error' => 'project_id, unit_number and valid status required'], 400);
    }
    $title    = isset($body['title']) && trim((string) $body['title']) !== '' ? trim((string) $body['title']) : null;
    $beds     = isset($body['beds'])  && $body['beds']  !== '' && $body['beds']  !== null ? intval($body['beds'])   : null;
    $baths    = isset($body['baths']) && $body['baths'] !== '' && $body['baths'] !== null ? intval($body['baths'])  : null;
    $area     = isset($body['area'])  && $body['area']  !== '' && $body['area']  !== null ? floatval($body['area']) : null;
    $floor    = isset($body['floor']) && $body['floor'] !== '' && $body['floor'] !== null ? intval($body['floor'])  : null;
    $price    = isset($body['price']) && $body['price'] !== '' && $body['price'] !== null ? floatval($body['price']) : null;
    $currency = trim((string) ($body['currency'] ?? 'USD')) ?: 'USD';
    $image    = isset($body['image_url']) && trim((string) $body['image_url']) !== '' ? trim((string) $body['image_url']) : null;
    $desc     = isset($body['description']) && trim((string) $body['description']) !== '' ? trim((string) $body['description']) : null;

    $galleryList = isset($body['gallery_images']) && is_array($body['gallery_images'])
        ? array_values(array_filter(array_map('strval', $body['gallery_images'])))
        : [];
    $galleryJson = !empty($galleryList) ? json_encode($galleryList) : null;
    $videoUrl = isset($body['video_url']) && trim((string) $body['video_url']) !== '' ? trim((string) $body['video_url']) : null;
    $techPlan = isset($body['technical_plan_url']) && trim((string) $body['technical_plan_url']) !== '' ? trim((string) $body['technical_plan_url']) : null;

    // Pack metadata tags into description for robust backup
    $descToStore = $desc;
    if ($techPlan) {
        $descToStore = ($descToStore ? $descToStore . "\n" : '') . "[TECHNICAL_PLAN: $techPlan]";
    }
    if ($galleryJson) {
        $descToStore = ($descToStore ? $descToStore . "\n" : '') . "[GALLERY: $galleryJson]";
    }
    if ($videoUrl) {
        $descToStore = ($descToStore ? $descToStore . "\n" : '') . "[VIDEO: $videoUrl]";
    }

    // Check if columns exist
    $hasGalleryCol = false;
    $hasVideoCol = false;
    $checkCols = $db->query("SHOW COLUMNS FROM project_units LIKE 'gallery_images'");
    if ($checkCols && $checkCols->num_rows > 0) $hasGalleryCol = true;
    $checkCols2 = $db->query("SHOW COLUMNS FROM project_units LIKE 'video_url'");
    if ($checkCols2 && $checkCols2->num_rows > 0) $hasVideoCol = true;

    if (!$hasGalleryCol || !$hasVideoCol) {
        @$db->query("ALTER TABLE project_units ADD COLUMN IF NOT EXISTS gallery_images TEXT DEFAULT NULL, ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000) DEFAULT NULL");
        $checkCols = $db->query("SHOW COLUMNS FROM project_units LIKE 'gallery_images'");
        if ($checkCols && $checkCols->num_rows > 0) $hasGalleryCol = true;
        $checkCols2 = $db->query("SHOW COLUMNS FROM project_units LIKE 'video_url'");
        if ($checkCols2 && $checkCols2->num_rows > 0) $hasVideoCol = true;
    }

    if ($method === 'POST') {
        if ($hasGalleryCol && $hasVideoCol) {
            $stmt = $db->prepare('INSERT INTO project_units (project_id,unit_number,title,beds,baths,area,floor,price,currency,status,image_url,gallery_images,video_url,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
            $stmt->bind_param('issiididssssss', $projectId, $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $galleryJson, $videoUrl, $descToStore);
        } else {
            $stmt = $db->prepare('INSERT INTO project_units (project_id,unit_number,title,beds,baths,area,floor,price,currency,status,image_url,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
            $stmt->bind_param('issiididssss', $projectId, $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $descToStore);
        }
        if (!$stmt->execute()) {
            if ($db->errno === 1062) {
                json_out(['error' => 'Unit number already exists in this project'], 409);
            }
            json_out(['error' => 'Failed to create unit: ' . $db->error], 500);
        }
        json_out(['id' => (int) $db->insert_id], 201);
    }

    if (!$id) json_out(['error' => 'id required'], 400);
    if ($hasGalleryCol && $hasVideoCol) {
        $stmt = $db->prepare('UPDATE project_units SET unit_number=?,title=?,beds=?,baths=?,area=?,floor=?,price=?,currency=?,status=?,image_url=?,gallery_images=?,video_url=?,description=? WHERE id=? AND project_id=?');
        $stmt->bind_param('ssiididssssssii', $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $galleryJson, $videoUrl, $descToStore, $id, $projectId);
    } else {
        $stmt = $db->prepare('UPDATE project_units SET unit_number=?,title=?,beds=?,baths=?,area=?,floor=?,price=?,currency=?,status=?,image_url=?,description=? WHERE id=? AND project_id=?');
        $stmt->bind_param('ssiididssssii', $unit, $title, $beds, $baths, $area, $floor, $price, $currency, $status, $image, $descToStore, $id, $projectId);
    }
    if (!$stmt->execute()) {
        if ($db->errno === 1062) {
            json_out(['error' => 'Unit number already exists in this project'], 409);
        }
        json_out(['error' => 'Failed to update unit: ' . $db->error], 500);
    }
    json_out(['updated' => (int) $stmt->affected_rows]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    $stmt = $db->prepare('DELETE FROM project_units WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        json_out(['error' => 'Failed to delete unit'], 500);
    }
    json_out(['deleted' => (int) $stmt->affected_rows]);
}

json_out(['error' => 'Method not allowed'], 405);
