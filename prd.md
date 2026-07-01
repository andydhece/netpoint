# NetPoint

### TL;DR

This application will centralize the management, monitoring, troubleshooting, and configuration of network devices and internet access across 54 distributed office points. Core features will include real-time network status, device administration, access management, and reporting to facilitate efficient IT operations and informed decision-making for leadership.

---

## Goals

### Business Goals

* Reduce network outage resolution time by 50% within 6 months.
* Improve visibility of network performance at all office points for executive management.
* Centralize IT management efforts to lower operational overhead by at least 20%.
* Support future integration with other IT infrastructure systems.

### User Goals

* Monitor real-time network device and internet status across all locations.
* Quickly identify and resolve network issues from a centralized dashboard.
* Access performance and service quality reports for executive decision-making.
* Manage network access and permissions per device/area efficiently.

### Non-Goals

* Management of end-user devices (like employee laptops, smartphones).
* Internet service procurement or ISP management functions.
* Integration with external, non-network infrastructure tools (at initial phase).

---

## User Stories

* Executive/Leadership:As an executive, I want a summary dashboard showing all network points and overall health, so that I have oversight.As an executive, I want to see internet speed and uptime metrics by location, so that I can justify investments.
* Admin IT:As an IT admin, I want to monitor device status and health in real time, so that I can respond proactively to issues.As an IT admin, I want to configure network parameters (SSID, VLAN, firewall), so that I can enforce corporate policy across all locations.As an IT admin, I want to assign and update user permissions by location, so that I can control access securely.As an IT admin, I want to see the installation date of each location so I can plan maintenance or upgrade cycles.
* Field Technician:As a technician, I want to receive alerts and troubleshooting guidance, so that I can fix issues faster on site.As a technician, I want to input repair actions and verify problem resolution, so that records remain up-to-date.As a technician, I want to upload a photo and my signature in the maintenance form for evidence and verification.
* Admin/Operations:As an admin, I want to manage office names, and assign each location to its responsible office, for better operational accountability.
* Admin:Sebagai admin, saya ingin menginput dan melihat koordinat lokasi (latitude, longitude) untuk setiap titik agar mudah ditemukan di lapangan.
* Pengguna:Sebagai pengguna, saya ingin melihat semua titik pada peta sehingga monitoring dan navigasi lebih mudah.
* User:Sebagai user, saya ingin seluruh tampilan aplikasi menggunakan Bahasa Indonesia agar lebih mudah dipahami.
* Admin:Sebagai admin, saya ingin mengelola data PIC pada setiap titik (nama, kontak, jabatan) untuk komunikasi dan tanggung jawab operasional.
* As an admin, I want to set a maximum internet speed (bandwidth) per location in Mbps so that bandwidth allocation is fair and aligned with policy.
* As a leader/executive, I want assurance that no location exceeds the configured maximum bandwidth so I can enforce policy and monitor compliance.

---

## Functional Requirements

## Functional Requirements

* **Monitoring & Dashboard (Priority: High)** -- Real-time network status map by location -- Current and historical bandwidth/speed usage per location -- Health check/status (online/offline) for routers and switches -- Incident and alert notifications -- Display and manage installation date for each network location (for audit, lifecycle management, and maintenance planning) -- Store GPS coordinates (latitude, longitude) for each location -- Visualize all locations on an interactive map (integrate with Leaflet / OpenStreetMap / Google Maps) -- Default application language: **Bahasa Indonesia** (UI and all displays) -- Display configured bandwidth limit per location and surface alerts when usage approaches or exceeds the configured limit -- Rekap data kantor: tampilkan tabel daftar kantor, jumlah titik per kantor, nama titik, koordinat, kecepatan aktual & maksimal per titik -- Tampilkan rekap jumlah total titik dan total bandwidth per kantor & untuk seluruh organisasi pada dashboard -- Tambahkan fitur ekspor rekap kantor–titik–bandwidth ke PDF (format siap cetak/distribusi) -- Sertakan tombol "Export PDF" pada section rekap di dashboard
* **Device & Access Management (Priority: High)** -- Device inventory and configuration management -- Centralized control of access permissions and networks (SSID, firewall rules) -- Ability to push bandwidth limit configuration to compatible devices (QoS/bandwidth shaping)
* **Troubleshooting & Support (Priority: Medium)** -- Automated diagnostic suggestions -- Field report logging and completion tracking -- Issue escalation workflow -- Maintenance report uploads including technician photo and signature (photo/signature stored with the maintenance report)
* **Reporting & Analytics (Priority: Medium)** -- Downloadable and visual performance reports (uptime, speed, outage frequency) -- Usage trends and anomaly detection -- Ability to group and filter reports by Office assignment -- Include bandwidth limit fields and alerts in reports and exportable data -- Support export of per-office recap (nama titik, koordinat, bandwidth) to PDF for reporting
* **Maintenance & Scheduling (Priority: Medium)** -- Scheduling of preventive/routine maintenance per location or device (create, view, edit, delete) -- Automatic notifications/reminders for upcoming maintenance to responsible users -- Form to record maintenance reports (date, performed by, actions taken, outcome) -- Maintenance history and downloadable report per location and device -- Maintenance reports should allow uploading a technician photo and signature as evidence/verification -- Automatically decrement spare part stock when parts are used in a maintenance action; show stock change in maintenance report
* **Office Management (Priority: Low)** -- Create, edit, and list office entities (e.g., Kantor A, Kantor B) -- Associate each network location with an office (office assignment used for accountability and reporting) -- Office list view includes column: Jumlah Titik, Total Bandwidth (sum batas maksimal per kantor) and quick link to view daftar titik per kantor
* **Location Contact & Spatial Data (Priority: High)** -- Add PIC data for each location (pic_name, pic_contact, pic_position) to support on-site communication and operational responsibility -- Ensure forms and detail pages capture PIC fields and display them in location detail
* **Inventory & Spare Parts (Priority: Medium)** -- Modul inventarisasi suku cadang jaringan (spareparts) dengan data: nama, jenis, lokasi penyimpanan, stok, dan status. -- Tampilan daftar sparepart, halaman detail stok, dan histori pergerakan stok. -- Pengurangan stok otomatis ketika sparepart dipakai pada maintenance/perbaikan; tangkapan transaksi penggunaan tercatat sebagai sparepart_usage. -- Laporan low-stock dan notifikasi restock threshold. -- Integrasi item sparepart ke form maintenance (pilih sparepart dan jumlah yang digunakan) sehingga penggunaan tercatat ke sparepart_usage dan stok berkurang.
* **History / Assignment Tracking (Priority: Medium)** -- Riwayat teknisi per lokasi: catat teknisi yang pernah ditugaskan/menangani maintenance di titik tersebut (nama, tanggal, tindakan). -- Riwayat perangkat per lokasi: histori pemasangan/penggantian perangkat termasuk tanggal, device id, dan teknisi terkait. -- Tampilkan riwayat teknisi dan riwayat perangkat di halaman detail lokasi, laporan, dan halaman perangkat untuk keperluan audit dan evaluasi.
* **Access Control & Ticketing (added requirements)** -- Sistem mendukung role-based access dengan tiga level user utama: **Admin** (akses penuh, konfigurasi & monitoring), **Pimpinan** (akses ke dashboard, laporan, monitoring, export; lihat tanpa hak edit), dan **Tim Lapangan / Teknisi** (akses ticketing, update status tiket, upload bukti, lihat lokasi & tugas yang diassign). -- Hak akses dikontrol melalui field `role` pada tabel `users` (enum: *admin*, *pimpinan*, *teknisi*/*lapangan*). -- Menu, fitur, dan dashboard otomatis menyesuaikan sesuai role user yang login (routing/authorization enforced by backend). -- Modul Tiketing internal: setiap insiden menjadi tiket yang dapat diassign ke teknisi atau tim lapangan. -- Status tiket: *open*, *assigned*, *in progress*, *resolved*, *closed*, *rejected*. -- Admin & Pimpinan dapat melihat rekap tiket dan filter berdasarkan lokasi, status, user, SLA. -- Notifikasi otomatis dikirim ke teknisi/admin saat terjadi update/penugasan/eskalasi tiket. -- Halaman Tiketing: tabel tiket, kolom status, assigned_to, SLA_target, action buttons (assign, update status, upload evidence). -- Tim Lapangan: daftar tiket yang diassign, ability to update progress, upload evidence (photo + signature), dan menutup tiket sesuai workflow.

## User Experience

Entry Point & First-Time User Experience

* Users access the web portal after invitation by admin; first-time users are guided through setup.
* Onboarding walks new users through main dashboard features, device registration, report tools, and Office management basics.

**Core Experience**

* **Step 1:** User logs in and lands on the main dashboard.
  * Dashboard displays map of all points and summary statistics.
  * Network health, alerts, and critical incidents are highlighted.
* **Step 2:** User selects a specific point/location.
  * View detailed device list, status, config, and usage history.
  * Quick access to reboot/update device or adjust network settings.
* **Step 3:** IT admin or technician receives alerts about detected incidents.
  * Troubleshooting workflow guides through resolution steps.
  * Technician logs repair outcome; status automatically updates.
* **Step 4:** Executive generates/report downloads data for selected time period.

**Advanced Features & Edge Cases**

* Bulk management for devices/settings across locations.
* Offline state: notifications if a point is unreachable.
* Audit logging for configuration changes.

**UI/UX Highlights**

* Responsive dashboard with clear, high-contrast summaries (label UI in Bahasa Indonesia)
* Accessibility standards for charts/reports
* Minimal-click flows for resolving alerts or launching troubleshooting

---

## Narrative

Across a national network of offices, IT teams and executives struggle with fragmented views and slow reactions to network incidents. Field technicians often receive information late or incomplete, hindering prompt repairs. With NetPoint, executives now have immediate, data-rich visibility; IT admins can monitor, configure, and secure all network points efficiently; and technicians receive live, actionable alerts with step-by-step repair guidance including the ability to attach photo and signature evidence to maintenance reports. The outcome is a more resilient, responsive network environment that supports business growth and reliability for all users, improved accountability through Office grouping and assignment, and enhanced spatial monitoring and navigation through GPS coordinates and interactive maps. Bahasa Indonesia is the default language for UI and content to support local users.

---

## Success Metrics

* Decrease average issue resolution time by at least 50% (tracked via support logs).
* Achieve 95%+ device uptime per location (system logs).
* Executive/adoption rate above 80% in the first 3 months.
* 100% device configuration changes audited and logged.
* Quarterly operational cost savings (IT staff hour reduction).

### User-Centric Metrics

* Number of issues detected and resolved proactively.
* User satisfaction scores from admin/technician feedback.

### Business Metrics

* Reduction in unplanned downtime (hours/month).
* Operating cost reduction documented in financial reports.

### Technical Metrics

* Network monitoring latency (should not exceed 1 min delay).
* Successful alert delivery rate to technicians/admins.
* System availability (target 99.9% uptime).

### Tracking Plan

* User login frequency
* Device status updates and incidents
* Configuration change events
* Report generation/downloads
* Alert resolution status by technician

---

## Technical Cnsiderations

### Technical Needs

* Centralized backend with device management, data aggregation, and alerting modules
* Secure APIs for device polling and status updates
* Web-based or cross-platform front-end for all user types
* Stack Guidance: Backend and database will use PHP and MySQL (managed via phpMyAdmin). The frontend will employ Tailwind CSS and DaisyUI for UI styling and components. Data model update: locations table should include an installation_date column (date) to support installation tracking, audit, lifecycle management, and maintenance planning. Additionally, update the data model to support maintenance report attachments and office association:

Data Model (ERD) updates:

* Table: maintenance_reports — add columns: photo_url (varchar), signature_url (varchar)
* Table: offices — columns: id (PK), name
* Table: locations — add column: office_id (FK) referencing offices.id, add columns: latitude (decimal), longitude (decimal), pic_name (varchar), pic_contact (varchar), pic_position (varchar), max_bandwidth_mbps (integer)
* Table: devices — (if separate devices table exists) add column: max_bandwidth_mbps (integer) to support per-device/endpoint limits where applicable

### Integration Points

* Routers, switches, and network devices at all locations (standards-based SNMP/API preferred) — note: bandwidth limit enforcement requires devices/gateways that support remote QoS/bandwidth shaping APIs or configuration interfaces.
* Interactive map library integration (Leaflet / OpenStreetMap / Google Maps) to display location markers by GPS coordinates and support marker click to view location + PIC details

### Data Storage & Privacy

* Device data, logs, configuration, and user/action audit logs
* Compliance with company and local data privacy policies

### Scalability & Performance

* Support for at least 100+ locations for future growth
* Real-time monitoring capacity
* Map rendering and marker clustering for large numbers of points

### Potential Challenges

* Device compatibility (if a mix of vendors/models)
* Network latency between sites and central server
* Security of remote access and privileged actions

---

## Milestones & Sequencing

### Project Estimate

* Medium: 2–4 weeks for MVP (Minimum Viable Product)

### Team Size & Composition

* Small Team: 2–3 people (Product Owner, Developer/DevOps, UI/UX Designer)

### Suggested Phases

**Phase 1: Requirement Finalization & Design (1 week)**

* Key Deliverables: Final requirements, wireframes, architecture design.
* Dependencies: Stakeholder input, high-level network documentation.

**Phase 2: MVP Development & Integration (2 weeks)**

* Key Deliverables: Core monitoring, device management, dashboard, alerting, maintenance report uploads (photo + signature), Office management pages
* Dependencies: Test network access, device credentials, and sample Office data for initial mapping

**Phase 3: Pilot & Iteration (1 week)**

* Key Deliverables: Deployment at select locations, feedback collection, refinement.
* Dependencies: Pilot location readiness, feedback from admin/technician users.

## Wireframes (Textual Layouts per Page)

### 1\. Dashboard (Network Overview)

```
+--------------------------------------------------------------------------------+ | Topbar: \[Logo\] \[Search\] \[Notifications •\] \[User\]                                  | +--------------------------------------------------------------------------------+ | Sidebar:                                                                     |  | |  • Overview / Ikhtisar                                                       |  | |  • Locations / Lokasi                                                       |  | |  • Devices / Perangkat                                                      |  | |  • Incidents / Insiden                                                      |  | |  • Reports / Laporan                                                        |  | |  • Offices / Kantor                                                         |  +----------------------+---------------------------+-----------------------------+ | Summary Cards         | Network Map / Status Grid  | Recent Alerts / Activity     | | --------------------- | -------------------------  | --------------------------- | | \[Uptime 95%\] \[Avg RT\] | \[Interactive map with pins showing all locations (marker klik tampilkan data lokasi & PIC)\] | • Alert: Site A - Offline    | | \[Open Incidents: 3\]   | Pin colors = OK/Warn/Crit  | • Technician: Logged repair  | +----------------------+---------------------------+-----------------------------+ | Footer: Quick actions: \[Acknowledge Alerts\] \[Create Incident\] \[Export Report\]    | +--------------------------------------------------------------------------------+

Notes/added elements:
- Dashboard shows per-location configured "Batas Kecepatan Maksimal" (Max Bandwidth) in Mbps next to usage metrics.
- Visual alerts and badges appear when usage approaches (e.g., >= 80%) or exceeds the configured limit.
- Reports and export include bandwidth limit column and alert status.

```

Description: A high-level overview page showing summary KPI cards, an interactive map or grid of locations with health status, and a feed of recent alerts and activities. Main UI elements: top navigation, left sidebar, KPI cards, network map/status grid, recent alerts panel, quick action buttons. User actions: filter/search, acknowledge alerts, drill into a location or device, export data. Dashboard now includes an Offices section and Office filter for grouping locations by office. Map integration: visualize all locations by GPS coordinates; klik marker untuk menampilkan informasi lokasi dan data PIC. UI dan semua label berbahasa Indonesia. Tambahan: tampilkan nilai Batas Kecepatan Maksimal per titik serta indikator/alert bila pemakaian mendekati atau melebihi batas.

Description: A high-level overview page showing summary KPI cards, an interactive map or grid of locations with health status, and a feed of recent alerts and activities. Main UI elements: top navigation, left sidebar, KPI cards, network map/status grid, recent alerts panel, quick action buttons. User actions: filter/search, acknowledge alerts, drill into a location or device, export data. Additions: maintenance reports include photo and signature uploads; Offices page accessible from nav to manage office entities and assign locations to offices.

### 2\. Locations List

```
+---------------------------------------------------------------+ | Topbar / Breadcrumbs: Home / Locations                         | +---------------------------------------------------------------+ | Toolbar: \[Search location\] \[Filter: status, region, office\] \[Add\] \[Export\]| +---------------------------------------------------------------+ | Table / Cards:                                                  | | ---------------------------------------------------------------- | | Name        | Status | Devices | Last Seen | Office     | Koordinat (Lat,Lng) | PIC (Nama / Kontak / Jabatan) | Batas Kecepatan Maksimal (Mbps) | Actions         | | | Site A      | OK     | 12      | 2m ago    | Kantor A    | -6.200000, 106.816666   | Budi / +62-812-3456 / Teknisi | 50 Mbps                         | \[View\] \[Alert\]  | | | Site B      | Warning| 8       | 15m ago   | Kantor B    | -6.914744, 107.609810   | Siti / +62-813-9876 / Koordinator | 20 Mbps                       | \[View\] \[Alert\]  | +---------------------------------------------------------------+ | Pagination / Controls                                            | +---------------------------------------------------------------+

Notes:
- Add column for configured max bandwidth (Mbps).
- Show alert badge in row when current usage approaches/exceeds configured limit.
```

Description: List or card view of all locations with status badges, device counts, last-seen timestamps, and Office assignment. Tailwind/DaisyUI-style elements: searchable toolbar, filter chips, table rows with badges and action buttons. User actions: search/filter (including by Office), open location detail, trigger alert or quick command, export list. Location list shows Office clearly and provides quick link to manage Offices. Include Batas Kecepatan Maksimal column and filterable alerts for bandwidth limit status.

Description: List or card view of all locations with status badges, device counts, and last-seen timestamps. Tailwind/DaisyUI-style elements: searchable toolbar, filter chips, table rows with badges and action buttons. User actions: search/filter, open location detail, trigger alert or quick command, export list.

### 3\. Devices List

```
+---------------------------------------------------------------+
| Topbar: Devices                                                |
+---------------------------------------------------------------+
| Toolbar: \[Search device/IP\] \[Filter: type/status/location\] \[Add\]|
+---------------------------------------------------------------+
| Table:                                                          |
| ----------------------------------------------------------------
| | Device Name | Type   | Location | Status | Firmware | Actions  |
| | Router-01   | Router | Site A   | Online | v1.2.3   | \[View\]   |
| | Switch-05   | Switch | Site B   | Offline| v2.0.0   | \[View\]   |
+---------------------------------------------------------------+
| Bulk actions: \[Reboot\] \[Push Config\] \[Assign\]  | Pagination      |
+---------------------------------------------------------------+
```

Description: Central index of managed devices with sortable columns and bulk action controls. UI elements: search, filters, status badges, per-device action menu. User actions: view device detail, bulk operations (reboot, config push), apply filters.

```
+--------------------------------------------------------------------------------+ | Breadcrumb: Locations / Site A / Device X                              \[Edit\] | +--------------------------------------------------------------------------------+ | Header Row: Device Name  | Status Badge | Last Seen | Quick actions \[Reboot\]  | +--------------------------------------------------------------------------------+ | Left Column (2/3):                           | Right Column (1/3):         | | - Live status & metrics (uptime, CPU, mem)   | - Recent incidents list     | | - Interfaces table (name, status, traffic)   | - Config summary            | | - Graphs: bandwidth over time                 | - Actions: Push config      | | - Event log / activity feed                   | - Technician notes / tasks  | +--------------------------------------------------------------------------------+ | Footer: \[Run Diagnostics\] \[Rollback Config\] \[Add Note\]                      | +--------------------------------------------------------------------------------+ | Additional Fields (Location-level / Device metadata):                          | | - Installation Date: YYYY-MM-DD                (visible if available)         | | - Koordinat: latitude, longitude (tampilkan di form/detail titik lokasi)     | | - PIC: nama, kontak, jabatan (tampilkan dan bisa diedit di halaman lokasi)  | | - Office:                 (shows assigned office; editable) | | - Batas Kecepatan Maksimal:  (Mbps) dan indikator status (Normal / Mendekati Batas / Melebihi Batas) | +--------------------------------------------------------------------------------+
```

Description: Detailed view for a single device with live metrics, interface states, historical graphs, event logs, configuration snapshot, and action buttons. UI elements follow Tailwind/DaisyUI: card layout, responsive columns, compact tables, action dropdowns. User actions: run diagnostics, reboot, push or rollback config, add notes, escalate. Location/Device metadata includes Office selection to reflect office assignment.

Description: Detailed view for a single device with live metrics, interface states, historical graphs, event logs, configuration snapshot, and action buttons. UI elements follow Tailwind/DaisyUI: card layout, responsive columns, compact tables, action dropdowns. User actions: run diagnostics, reboot, push or rollback config, add notes, escalate. Device page and associated Location detail include Office assignment and display. Location/detail forms must show and allow editing of: Installation Date, Koordinat (latitude, longitude), dan data PIC (nama, kontak, jabatan). Semua label dan instruksi ditampilkan dalam Bahasa Indonesia.

### 5\. Incidents/Alerts

```
+---------------------------------------------------------------+ | Topbar: Incidents / Alerts                                    | +---------------------------------------------------------------+ | Filters: \[Status: open/all\] \[Severity\] \[Assigned to\] \[Time range\] \[Office\] \[Bandwidth limit status\] | +---------------------------------------------------------------+ | List / Kanban of incidents                                   | | ---------------------------------------------------------------- | | #1234 | Critical | Site A - Router down | 5m ago | \[Acknowledge\] | | | #1235 | High     | Site B - High bandwidth usage (near limit) | 30m ago| \[Assign\]     | +---------------------------------------------------------------+ | Detail Pane (slide-over):                                     | | - Incident timeline, affected devices, suggested runbook steps  | | - Actions: assign, add note, change status, link ticket        | +---------------------------------------------------------------+

Notes:
- Add filter and incident types for bandwidth limit alerts (approaching/exceeded limits).

```

Description: Central incident board for triage and management. Elements: filters, sortable list or kanban, incident detail panel with timeline and recommended troubleshooting steps. User actions: acknowledge, assign, add comments, follow runbook, close incident, create escalation. Incidents can be filtered by Office.

Description: Central incident board for triage and management. Elements: filters, sortable list or kanban, incident detail panel with timeline and recommended troubleshooting steps. User actions: acknowledge, assign, add comments, follow runbook, close incident, create escalation.

### 6\. Reports

```
+---------------------------------------------------------------+ | Topbar: Reports                                                | +---------------------------------------------------------------+ | Report Builder Toolbar: \[Select metric\] \[Time range\] \[Group by\] | | \[Apply\] \[Save Template\] \[Export CSV / PDF\]                      | +---------------------------------------------------------------+ | Report Preview Area                                            | | ---------------------------------------------------------------- | - KPI cards (uptime, avg resolution time)                       | | - Time-series charts (bandwidth, incidents over time)          | | - Table of per-location metrics                                | +---------------------------------------------------------------+ | Saved Templates / Scheduled Reports Sidebar                    | +---------------------------------------------------------------+ | Office grouping and Office filter available for report generation | +---------------------------------------------------------------+
```

Description: Reporting interface to build, preview, and export analytics. UI elements: builder controls, charting area, export buttons, saved templates. User actions: configure metrics/time range, generate and export reports, schedule recurring reports, save templates. Reports support grouping/filtering by Office.

Description: Reporting interface to build, preview, and export analytics. UI elements: builder controls, charting area, export buttons, saved templates. User actions: configure metrics/time range, generate and export reports, schedule recurring reports, save templates.