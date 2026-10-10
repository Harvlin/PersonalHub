# Project Lifecycle × Health Status Model - Implementation Summary

## Data Migration Strategy

**Mapping from old model to new model:**

| Old Model (archived, status) | New Model (lifecycle, health) |
|-----|-----|
| archived=true, status=ANY | lifecycle=ARCHIVED, health=ON_TRACK |
| archived=false, status="passive" | lifecycle=PASSIVE, health=ON_TRACK |
| archived=false, status="blocked" | lifecycle=ACTIVE, health=BLOCKED, blockedReason="(legacy)", blockedSince=NOW |
| archived=false, status="todo"/"in_progress"/"waiting"/"done" | lifecycle=ACTIVE, health=ON_TRACK |

**Migration Implementation:**
- Flyway SQL migration added: `backend/src/main/resources/db/migration/V1__add_lifecycle_health_model.sql`
- Automatically runs on application startup
- Creates new columns with defaults, migrates data, adds NOT NULL constraints

## Backend Changes

### New Enums
- `ProjectLifecycle.java`: ACTIVE, PASSIVE, ARCHIVED
- `ProjectHealth.java`: ON_TRACK, BLOCKED

### Updated Entity
- **File**: `backend/src/main/java/com/personalhub/api/entity/Project.java`
- Added fields:
  - `ProjectLifecycle lifecycle` (default: ACTIVE, not null)
  - `ProjectHealth health` (default: ON_TRACK, not null)
  - `String blockedReason` (nullable, max 500 chars)
  - `Instant blockedSince` (nullable)
- Kept old fields for backward compatibility during transition:
  - `Status status`
  - `boolean archived`

### Updated DTO
- **File**: `backend/src/main/java/com/personalhub/api/dto/ProjectDto.java`
- Added new fields to response: lifecycle, health, blockedReason, blockedSince

### Updated Request DTO
- **File**: `backend/src/main/java/com/personalhub/api/dto/RequestModels.java`
- `ProjectPatch` now accepts: lifecycle, health, blockedReason

### Updated Service
- **File**: `backend/src/main/java/com/personalhub/api/service/impl/ProjectServiceImpl.java`
- Enhanced `update()` method:
  - Sets lifecycle when provided
  - Sets health with validation: BLOCKED requires non-empty blockedReason
  - Sets blockedSince=NOW when transitioning to BLOCKED
  - Clears blockedSince when transitioning from BLOCKED to ON_TRACK
  - Added import for `ProjectHealth` enum

### Dependency Update
- **File**: `backend/pom.xml`
- Added `org.flywaydb:flyway-core` dependency for database migrations

## Frontend Changes

### Updated Store Types
- **File**: `frontend/src/lib/store.tsx`
- Added type definitions:
  - `ProjectLifecycle = "ACTIVE" | "PASSIVE" | "ARCHIVED"`
  - `ProjectHealth = "ON_TRACK" | "BLOCKED"`
- Updated `Project` type:
  - Added: `lifecycle: ProjectLifecycle`
  - Added: `health: ProjectHealth`
  - Added: `blocked_reason?: string`
  - Added: `blocked_since?: string`
  - Kept old fields for backward compatibility: `status`, `is_archived`
- Updated `ApiWorkspace` type to include new fields from backend
- Updated `mapWorkspace()` function to normalize new fields with defaults

### Updated Project Operations
- **File**: `frontend/src/lib/store.tsx`
- `addProject()`: Maps new fields from response
- `updateProject()`: Sends lifecycle, health, blockedReason to backend

### Dashboard Enhancements
- **File**: `frontend/src/routes/dashboard.tsx`
- Updated filtering logic:
  - Tasks from ACTIVE projects shown in Today/This Week
  - Overdue tasks shown regardless of project lifecycle/health
  - Blocked tasks always shown
  - Task context labels: "project paused" for Passive projects, "project blocked" for Blocked projects
- Added "Needs Attention" section for ACTIVE+BLOCKED projects:
  - Shows project name, blocked reason, duration ("blocked Xd")
  - Sorted with other attention items (tasks, contact pings)

### Project Detail Page
- **File**: `frontend/src/routes/projects.$id.tsx`
- Replaced single status dropdown with:
  - Lifecycle dropdown: ACTIVE, PASSIVE, ARCHIVED
  - Health dropdown: ON_TRACK, BLOCKED
- Added blocked reason input:
  - Appears when health is set to BLOCKED
  - Validates non-empty reason before saving
  - Shows "blocked for Xd" in metadata
- Updated archive/unarchive logic to use lifecycle
- Updated active-project-limit check to count ACTIVE lifecycle projects

### Projects List Page
- **File**: `frontend/src/routes/projects.index.tsx`
- Updated tab filtering: "active" tab shows all non-ARCHIVED projects, "archived" tab shows ARCHIVED projects
- Updated archive/unarchive action to set lifecycle

### AppShell Navigation
- **File**: `frontend/src/components/AppShell.tsx`
- Updated active projects filter: `lifecycle === "ACTIVE"`
- Updated capacity check modal to set lifecycle="PASSIVE" instead of status="passive"

### Settings Page
- **File**: `frontend/src/routes/settings.tsx`
- Updated archived projects filter: `lifecycle === "ARCHIVED"`
- Updated unarchive action: `lifecycle = "ACTIVE"`

### Added Imports
- `ageInDays` imported in `projects.$id.tsx` and dashboard for duration calculations

## Behavior Implementation

### Dashboard Behavior Matrix

| Lifecycle | Health | Task Visibility | Project in Needs Attention | Notes |
|-----------|--------|-----------------|----------------------------|-------|
| ACTIVE | ON_TRACK | Today/This Week | No | Normal operation |
| ACTIVE | BLOCKED | Today/This Week | Yes, with reason | Urgent attention required |
| PASSIVE | ON_TRACK | Hidden | No | User consciously paused |
| PASSIVE | BLOCKED | Hidden | No | Blocker not relevant when paused |
| ARCHIVED | — | Hidden | No | Project complete/closed |
| ANY | — (overdue task) | Needs Attention | Yes, if overdue | Deadlines override project state |

### Validation Rules
- Health=BLOCKED requires non-empty blockedReason (checked in backend service)
- Lifecycle can transition freely between states
- Health can transition freely between ON_TRACK and BLOCKED
- Blocked reason persists until health changed back to ON_TRACK

## Verification Checklist

### To verify live after deployment:

1. **Active+Blocked project shows in Needs Attention**
   - Create/set project to ACTIVE lifecycle, BLOCKED health with reason
   - Verify: project appears in dashboard "Needs Attention" section with reason and duration
   - Verify: tasks still show in Today/This Week view

2. **Passive+Blocked project hidden from Needs Attention**
   - Set project to PASSIVE lifecycle, BLOCKED health with reason
   - Verify: project does NOT appear in Needs Attention
   - Verify: tasks hidden from Today/This Week
   - Verify: project can still be accessed via Projects page

3. **Passive project with overdue task surfaces correctly**
   - Create task with past due date in PASSIVE project
   - Verify: task appears in Needs Attention with "project paused" label
   - Verify: label distinguishes it from normal tasks

4. **Unblock project nudge (future phase)**
   - Set project ACTIVE+BLOCKED
   - Create BLOCKED tasks within the project
   - Switch health to ON_TRACK
   - Verify: gentle prompt "This project still has N blocked tasks — want to review them?"
   - Verify: nothing auto-resolves

5. **Visual distinction of glyphs**
   - Active projects: solid square (■)
   - Passive projects: outlined square with pause icon (⊡ ⏸)
   - Blocked projects: badge/dot on corner
   - Archived projects: no glyph (appears only in Archived tab)
   - Task status circles: remain unchanged (filled, half, dashed, empty for task progress)
   - Verify: all visually distinct at a glance

## Known Implementation Notes

- Old `status` and `archived` fields kept in entity for backward compatibility during transition
- Can be removed in a future cleanup migration after all clients updated
- Flyway migration idempotent: uses `WHERE lifecycle = 'ACTIVE'` to prevent re-running
- Frontend keeps backward compatibility by defaulting new fields: `lifecycle ?? "ACTIVE"`, `health ?? "ON_TRACK"`
- Active project limit logic now counts: `projects.filter(p => p.lifecycle === "ACTIVE").length`
- Dashboard overdue task labels context-aware based on project lifecycle state

## Architecture Consistency

Following existing patterns from the codebase:

- **Validation pattern**: Reused task-level BLOCKED validation pattern (requires reason) at project level
- **Status/State modeling**: Two independent axes following same philosophy as task status independence
- **API normalization**: Backend enum uppercase, frontend normalized to uppercase types
- **Migration strategy**: Flyway SQL for schema + data, consistent with Spring Boot conventions
- **DTO mapping**: Uses MapStruct through existing ProjectMapper, no new patterns introduced
