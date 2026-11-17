-- READ ONLY. Select the NEW V2 testing database in phpMyAdmin first.
SELECT DATABASE() AS selected_v2_database;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema=DATABASE();
-- Complete single-DB import (complete-v2-mysql-schema.sql): 60+ tables covering Website, Core, Call Center, Inventory, Sales, HR, Finance, Marketing, Engineering & Submissions.
SELECT id,code,name,active FROM core_branches ORDER BY id;
-- Expected: id=1, code='HQ', name='Main Branch (Kabul)', active=1.
SELECT id,name FROM projects ORDER BY id;
-- Fresh packages contain no public website projects.
SELECT project_id,COUNT(*) AS sample_layouts FROM project_units GROUP BY project_id ORDER BY project_id;
-- Fresh packages contain no public project-unit records.
SELECT canonical_base_url,robots_index FROM seo_settings WHERE id=1;
-- Expected: https://attaieproperties.com and 1.
SELECT username,LEFT(password_hash,4) AS hash_prefix FROM admin_users;
-- Website owner hash prefix: $2y$.
SELECT code,name FROM core_departments ORDER BY code;
SELECT code,department_code,name FROM core_roles ORDER BY department_code,code;
SELECT module_code,version FROM core_module_versions ORDER BY module_code;
SELECT id,name,username,role,branch_id,team_leader_id,active FROM core_users ORDER BY id;
-- CEO appears AFTER filling/importing 04-staff-ceo.template.sql; Sales Leaders and Sales Agents appear after CEO creates them in /ceo/.
