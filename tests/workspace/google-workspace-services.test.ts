import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTAIE_DRIVE_FOLDER_NAME,
  buildDriveUploadMetadata,
} from '../../shared/googleWorkspaceCore';
import {
  DEFAULT_PROJECT_INVENTORY_TAB,
  DEFAULT_SALES_LEADS_TAB,
  PROJECT_INVENTORY_HEADERS,
  SALES_LEADS_HEADERS,
  adaptAdminLeadForSheet,
  adaptAdminProjectForSheet,
  adaptStaffLeadForSheet,
  adaptStaffProjectForSheet,
  buildProjectInventorySheetRows,
  buildSalesLeadsSheetRows,
} from '../../shared/googleSheetsExportService';
import {
  buildCrmCalendarEventPayload,
  extractAgentEmail,
  resolveAgentCalendarTarget,
} from '../../shared/googleCalendarSyncService';

test('Drive upload metadata targets dedicated Attaie Properties folder and sets category properties', () => {
  assert.equal(ATTAIE_DRIVE_FOLDER_NAME, 'Attaie Properties');

  const meta = buildDriveUploadMetadata({
    fileName: '  Shahr-e-Naw-Brochure.pdf ',
    mimeType: 'application/pdf',
    folderId: 'folder-123',
    category: 'brochure',
    projectRef: 'PRJ-01 — Emerald Towers',
    description: 'Dari & English bilingual brochure',
    uploadedBy: 'admin@attaieproperties.com',
  });

  assert.equal(meta.name, 'Shahr-e-Naw-Brochure.pdf');
  assert.equal(meta.mimeType, 'application/pdf');
  assert.deepEqual(meta.parents, ['folder-123']);
  assert.equal(meta.description, 'Dari & English bilingual brochure');
  assert.deepEqual(meta.appProperties, {
    attaieCategory: 'brochure',
    projectRef: 'PRJ-01 — Emerald Towers',
    uploadedBy: 'admin@attaieproperties.com',
  });

  const fallbackMeta = buildDriveUploadMetadata({
    fileName: 'floor-plan-v2.dwg',
    mimeType: '',
    folderId: 'folder-123',
    category: 'architectural',
  });
  assert.equal(fallbackMeta.mimeType, 'application/octet-stream');
  assert.equal(fallbackMeta.description, undefined);
  assert.deepEqual(fallbackMeta.appProperties, { attaieCategory: 'architectural' });
});

test('Google Sheets adapters and row builders format staff/admin leads and project inventory', () => {
  assert.equal(DEFAULT_SALES_LEADS_TAB, 'Sales Leads');
  assert.equal(DEFAULT_PROJECT_INVENTORY_TAB, 'Project Inventory');

  const staffLead = adaptStaffLeadForSheet(
    {
      id: 42,
      serial: 'CC01-42',
      stageSerial: 'SA02-42',
      customerName: 'Ahmad Zaki',
      phone: '0782000111',
      projectCode: 'PRJ01',
      projectName: 'Arya Residence',
      apartmentNumber: 'A04-02',
      status: 'active',
      source: 'walk_in',
      assigneeId: 7,
      callAt: '2026-11-16T10:00:00Z',
      requirements: '3 bedroom apartment facing road',
    },
    [{ id: 7, name: 'Fardin Rahimi' }],
  );

  const adminLead = adaptAdminLeadForSheet({
    id: 99,
    name: 'Mariam Noori',
    email: 'mariam@example.com',
    phone: '0799111222',
    message: 'Interested in villa pricing',
    property_name: 'Kart-e-Char Villa',
    stage: 'Qualified',
    source: 'Website',
    status: 'active',
    receipt_reference: 'WEB-99',
    followup_status: 'in_progress',
    followup_notes: 'Call back tomorrow',
    followup_at: '2026-11-17T08:30:00Z',
    created_at: '2026-11-16T07:00:00Z',
  });

  const leadRows = buildSalesLeadsSheetRows([staffLead, adminLead], '2026-11-16T12:00:00Z');
  assert.equal(leadRows.length, 3);
  assert.deepEqual(leadRows[0], [...SALES_LEADS_HEADERS]);
  assert.equal(leadRows[1][1], 'SA02-42');
  assert.equal(leadRows[1][5], 'PRJ01 — Arya Residence');
  assert.equal(leadRows[1][9], 'Fardin Rahimi');
  assert.equal(leadRows[2][0], 'WEB-99');
  assert.equal(leadRows[2][11], 'Interested in villa pricing | Call back tomorrow');

  const staffProject = adaptStaffProjectForSheet({
    id: 1,
    code: 'PRJ01',
    name: 'Arya Residence',
    location: 'Shahr-e-Naw, Kabul',
    status: 'presale',
    totalAreaSqm: 4500,
    floors: 10,
    apartments: [
      {
        unitNumber: 'A02-01',
        serialNumber: 'PRJ01-A02-01',
        floor: 2,
        kind: 'apartment',
        rooms: 3,
        areaSqm: 140,
        pricePerSqm: 900,
        totalPrice: 126000,
        currency: 'USD',
        status: 'available',
      },
      {
        unitNumber: 'A02-02',
        serialNumber: 'PRJ01-A02-02',
        floor: 2,
        kind: 'apartment',
        rooms: 2,
        areaSqm: 105,
        pricePerSqm: 900,
        totalPrice: 94500,
        currency: 'USD',
        status: 'sold',
      },
    ],
  });

  const emptyAdminProject = adaptAdminProjectForSheet(
    {
      id: 5,
      name: 'Kabul Business Plaza',
      location: 'Wazir Akbar Khan',
      status: 'Coming Soon',
      available_units: 12,
      total_units: 12,
    },
    [],
  );

  const inventoryRows = buildProjectInventorySheetRows(
    [staffProject, emptyAdminProject],
    '2026-11-16T12:00:00Z',
  );
  assert.equal(inventoryRows.length, 4); // 1 header + 2 units + 1 empty-project summary row
  assert.deepEqual(inventoryRows[0], [...PROJECT_INVENTORY_HEADERS]);
  assert.equal(inventoryRows[1][6], '1 / 2');
  assert.equal(inventoryRows[1][7], 'A02-01');
  assert.equal(inventoryRows[3][0], 'PRJ-5');
  assert.equal(inventoryRows[3][10], 'Project Summary');
});

test('Calendar sync resolves assigned agent calendar targets and builds Kabul-timezone events', () => {
  assert.equal(
    extractAgentEmail({ email: 'agent1@attaieproperties.com', username: 'agent1' }),
    'agent1@attaieproperties.com',
  );
  assert.equal(
    extractAgentEmail({ email: '', username: 'agent2@attaieproperties.com' }),
    'agent2@attaieproperties.com',
  );
  assert.equal(extractAgentEmail({ email: 'not-an-email', username: 'agent2' }), '');

  const directResolution = resolveAgentCalendarTarget(
    [
      { id: 'primary', summary: 'Manager', primary: true, accessRole: 'owner' },
      { id: 'salma@attaieproperties.com', summary: 'Salma', accessRole: 'writer' },
    ],
    'salma@attaieproperties.com',
    'manager@attaieproperties.com',
  );
  assert.equal(directResolution.calendarId, 'salma@attaieproperties.com');
  assert.equal(directResolution.isDirectAgentCalendar, true);
  assert.equal(directResolution.attachAttendee, true);

  const fallbackResolution = resolveAgentCalendarTarget(
    [{ id: 'primary', summary: 'Manager', primary: true, accessRole: 'owner' }],
    'nawid@attaieproperties.com',
    'manager@attaieproperties.com',
  );
  assert.equal(fallbackResolution.calendarId, 'primary');
  assert.equal(fallbackResolution.isDirectAgentCalendar, false);
  assert.equal(fallbackResolution.attachAttendee, true);

  const sameUserResolution = resolveAgentCalendarTarget(
    [{ id: 'primary', summary: 'Salma', primary: true, accessRole: 'owner' }],
    'salma@attaieproperties.com',
    'salma@attaieproperties.com',
  );
  assert.equal(sameUserResolution.attachAttendee, false);

  const visitPayload = buildCrmCalendarEventPayload({
    scheduleType: 'visit',
    customerName: 'Karimullah',
    customerPhone: '0781234567',
    propertyOrProject: 'PRJ01 — Arya Residence',
    serial: 'VISIT-12',
    scheduledAtIso: '2026-11-20T09:00:00.000Z',
    notes: 'Bring floor plan brochure',
    assignedAgentName: 'Salma Sadat',
    assignedAgentEmail: 'salma@attaieproperties.com',
  });
  assert.equal(visitPayload.summary, '[Property Visit] Karimullah — PRJ01 — Arya Residence');
  assert.equal(visitPayload.timeZone, 'Asia/Kabul');
  assert.equal(visitPayload.startIso, '2026-11-20T09:00:00.000Z');
  assert.equal(visitPayload.endIso, '2026-11-20T10:00:00.000Z'); // 60 mins for visit
  assert.deepEqual(visitPayload.attendees, [
    { email: 'salma@attaieproperties.com', displayName: 'Salma Sadat' },
  ]);

  const followupPayload = buildCrmCalendarEventPayload({
    scheduleType: 'followup',
    customerName: 'Zainab',
    scheduledAtIso: '2026-11-20T09:00:00.000Z',
  });
  assert.equal(followupPayload.endIso, '2026-11-20T09:30:00.000Z'); // 30 mins for follow-up

  assert.throws(
    () =>
      buildCrmCalendarEventPayload({
        scheduleType: 'followup',
        customerName: 'Zainab',
        scheduledAtIso: 'invalid-date',
      }),
    /Invalid follow-up or visit date\/time/,
  );
});
