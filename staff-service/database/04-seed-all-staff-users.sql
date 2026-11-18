-- INTERNAL CRM DATABASE ONLY (Import into your Attaie CRM database in phpMyAdmin)
-- Maps the CEO and all 10 departmental staff members to their exact Firebase UIDs and roles.

SET NAMES utf8mb4;

-- 1. Ensure the primary headquarters branch exists
INSERT INTO core_branches (id, code, name, address, phone, email, active)
VALUES (1, 'KBL-HQ', 'Kabul Main Branch', 'Shahr-e Naw, Kabul, Afghanistan', '+93782222279', 'info@attaieproperties.com', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), active = 1;

-- 2. Insert or update the CEO
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('AyAy8pvBKMb7Uqj6NFBE03Opw5W2', 'Ceo@attaieproperties.com', 'Faiz Mohammad Attaie', 'ceo', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role='ceo', branch_id=1, active=1;

-- 3. Insert or update all departmental team members

-- Sales Agent
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('NqAYxhprk2XKgQtqgjXLTwvpU5U2', 'emalkarimi@attaieproperties.com', 'Emal Karimi', 'sales', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Call Center Agent
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('yLz9soswvdQJSD8mJFQ5QCREID13', 'attaullah@attaieproperties.com', 'Atta Ullah', 'callcenter', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Sales Team Leader
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('TVQGvlQj0fd6N9MXozxSTqhL9Ka2', 'Basirwahidi@attaieproperties.com', 'Basir Wahidi', 'sales_leader', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Marketing Manager
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('EopYP3KgjgNQlJc5ZfZNxraCLpE2', 'sameerkakar@attaieproperties.com', 'Sameer Kakar', 'marketing_manager', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Editor
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('ezxgoUltXgcZ0qUcnQSYOqjl24e2', 'samimyousufi@attaieproperties.com', 'Samim Yousufi', 'editor', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Videographer
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('JivvGtQfo7bRFPewBeHlTTy8uMY2', 'ekrammalik@attaieproperties.com', 'Ekram Malik', 'videographer', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Finance Manager
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('Wuz5TNja9fUVMiOXy9ddC9CQYhI2', 'azamsadat@attaieproperties.com', 'Said Azam Sadat', 'finance_manager', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Architect
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('IYIRlNZj7bTMa8hQMCsxdUDIzm42', 'Milad@attaieproperties.com', 'Milad', 'architect', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- Graphic Designer
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('IvdT8F8pSCdTQortZFPNOlTrUl72', 'samim@attaieproperties.com', 'Samim', 'graphic_designer', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;

-- 3D Visual Designer
INSERT INTO core_users (firebase_uid, username, name, role, branch_id, active)
VALUES ('5ysa1VlfyVTEPbxxam1McWze1Ki2', 'shaheerahmadi@attaieproperties.com', 'Shaheer Ahmadi', 'visual_designer_3d', 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), branch_id=VALUES(branch_id), active=1;
