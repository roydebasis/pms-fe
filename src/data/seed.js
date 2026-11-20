// Seed data modelled directly after the Zoniq ERD.
// Relationships are expressed with the same foreign keys used in the diagram.

export const organizations = [
  { id: 1, name: 'Northstar Living', subscription_status: 'active', plan: 'Growth', created_at: '2023-02-14' },
  { id: 2, name: 'Harbor Point Realty', subscription_status: 'active', plan: 'Scale', created_at: '2023-06-01' },
  { id: 3, name: 'Cedar & Co.', subscription_status: 'trialing', plan: 'Starter', created_at: '2025-11-02' },
]

export const users = [
  { id: 1, organization_id: 1, name: 'Alex Morgan', email: 'alex@northstarliving.com', phone: '(206) 555-0101', is_platform_admin: false, role: 'admin', status: 'active', avatar_color: '#6366f1' },
  { id: 2, organization_id: 1, name: 'Priya Shah', email: 'priya@northstarliving.com', phone: '(206) 555-0102', is_platform_admin: false, role: 'property_manager', status: 'active', avatar_color: '#8b5cf6' },
  { id: 3, organization_id: 1, name: 'Marcus Lee', email: 'marcus@northstarliving.com', phone: '(206) 555-0103', is_platform_admin: false, role: 'maintenance', status: 'active', avatar_color: '#f59e0b' },
  { id: 4, organization_id: 1, name: 'Rachel Adams', email: 'rachel@northstarliving.com', phone: '(206) 555-0104', is_platform_admin: false, role: 'accountant', status: 'active', avatar_color: '#ec4899' },
  { id: 5, organization_id: 1, name: 'Sarah Chen', email: 'sarah.chen@example.com', phone: '(206) 555-0142', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#0ea5e9' },
  { id: 6, organization_id: 1, name: 'Daniel Okoro', email: 'daniel.okoro@example.com', phone: '(206) 555-0143', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#14b8a6' },
  { id: 7, organization_id: 1, name: 'Emily Carter', email: 'emily.carter@example.com', phone: '(206) 555-0144', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#f97316' },
  { id: 8, organization_id: 1, name: 'James Wilson', email: 'james.wilson@example.com', phone: '(206) 555-0145', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#84cc16' },
  { id: 9, organization_id: 1, name: 'Olivia Brown', email: 'olivia.brown@example.com', phone: '(206) 555-0146', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#a855f7' },
  { id: 10, organization_id: 1, name: 'Noah Williams', email: 'noah.williams@example.com', phone: '(206) 555-0147', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#38bdf8' },
  { id: 11, organization_id: 1, name: 'Ava Patel', email: 'ava.patel@example.com', phone: '(206) 555-0148', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#fb7185' },
  { id: 12, organization_id: 1, name: 'Liam Taylor', email: 'liam.taylor@example.com', phone: '(206) 555-0149', is_platform_admin: false, role: 'tenant', status: 'active', avatar_color: '#22c55e' },
  { id: 13, organization_id: 2, name: 'Mia Rodriguez', email: 'mia@harborpoint.com', phone: '(619) 555-0113', is_platform_admin: false, role: 'admin', status: 'active', avatar_color: '#0f766e' },
]

export const properties = [
  { id: 1, organization_id: 1, name: 'The Lumen', city: 'Seattle, WA', address: '1200 Pine St, Seattle, WA 98101', type: 'Apartment', acquired_at: '2022-04-18' },
  { id: 2, organization_id: 1, name: 'Cedar Grove', city: 'Austin, TX', address: '88 Barton Springs Rd, Austin, TX 78704', type: 'Apartment', acquired_at: '2023-01-10' },
  { id: 3, organization_id: 1, name: 'Harborline Residences', city: 'Portland, OR', address: '410 NW 12th Ave, Portland, OR 97209', type: 'Condo', acquired_at: '2021-09-05' },
  { id: 4, organization_id: 1, name: 'The Fitzroy', city: 'Denver, CO', address: '1600 Larimer St, Denver, CO 80202', type: 'Mixed-use', acquired_at: '2024-03-22' },
  { id: 5, organization_id: 1, name: 'Maple Court', city: 'Seattle, WA', address: '745 Maple Ave, Seattle, WA 98122', type: 'Townhome', acquired_at: '2023-11-14' },
  { id: 6, organization_id: 2, name: 'Sunset Villas', city: 'San Diego, CA', address: '22 Coast Hwy, San Diego, CA 92101', type: 'Villa', acquired_at: '2024-07-30' },
]

export const units = [
  { id: 1, property_id: 1, unit_number: '101', base_rent: 2450, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 720 },
  { id: 2, property_id: 1, unit_number: '102', base_rent: 2300, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 690 },
  { id: 3, property_id: 1, unit_number: '103', base_rent: 3100, status: 'vacant', bedrooms: 2, bathrooms: 2, sqft: 980 },
  { id: 4, property_id: 1, unit_number: '201', base_rent: 2750, status: 'occupied', bedrooms: 2, bathrooms: 1, sqft: 910 },
  { id: 5, property_id: 1, unit_number: '202', base_rent: 2900, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 950 },
  { id: 6, property_id: 1, unit_number: '203', base_rent: 2450, status: 'maintenance', bedrooms: 1, bathrooms: 1, sqft: 730 },
  { id: 7, property_id: 2, unit_number: 'A1', base_rent: 1850, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 640 },
  { id: 8, property_id: 2, unit_number: 'A2', base_rent: 1950, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 660 },
  { id: 9, property_id: 2, unit_number: 'B1', base_rent: 2600, status: 'vacant', bedrooms: 2, bathrooms: 2, sqft: 890 },
  { id: 10, property_id: 2, unit_number: 'B2', base_rent: 2500, status: 'occupied', bedrooms: 2, bathrooms: 1, sqft: 870 },
  { id: 11, property_id: 3, unit_number: '301', base_rent: 3400, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 1100 },
  { id: 12, property_id: 3, unit_number: '302', base_rent: 3600, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 1150 },
  { id: 13, property_id: 3, unit_number: '303', base_rent: 4200, status: 'vacant', bedrooms: 3, bathrooms: 2, sqft: 1350 },
  { id: 14, property_id: 3, unit_number: '304', base_rent: 3300, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 1080 },
  { id: 15, property_id: 4, unit_number: '1A', base_rent: 2200, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 700 },
  { id: 16, property_id: 4, unit_number: '1B', base_rent: 2250, status: 'occupied', bedrooms: 1, bathrooms: 1, sqft: 710 },
  { id: 17, property_id: 4, unit_number: '2A', base_rent: 2950, status: 'vacant', bedrooms: 2, bathrooms: 2, sqft: 960 },
  { id: 18, property_id: 4, unit_number: '2B', base_rent: 3050, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 990 },
  { id: 19, property_id: 5, unit_number: '1', base_rent: 2800, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 1020 },
  { id: 20, property_id: 5, unit_number: '2', base_rent: 2850, status: 'occupied', bedrooms: 2, bathrooms: 2, sqft: 1040 },
  { id: 21, property_id: 5, unit_number: '3', base_rent: 2700, status: 'vacant', bedrooms: 2, bathrooms: 1, sqft: 1000 },
  { id: 22, property_id: 6, unit_number: '10', base_rent: 4100, status: 'occupied', bedrooms: 3, bathrooms: 3, sqft: 1600 },
  { id: 23, property_id: 6, unit_number: '11', base_rent: 3900, status: 'vacant', bedrooms: 3, bathrooms: 2, sqft: 1520 },
]

export const leases = [
  { id: 1, unit_id: 1, monthly_rent: 2450, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2026-12-01', status: 'active', start_date: '2024-12-01', end_date: '2026-11-30', increment_percent: 4 },
  { id: 2, unit_id: 2, monthly_rent: 2300, rent_increment_mode: 'cpi', next_increment_due_date: '2027-01-01', status: 'active', start_date: '2025-01-01', end_date: '2026-12-31', increment_percent: null },
  { id: 3, unit_id: 4, monthly_rent: 2750, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2026-11-20', status: 'active', start_date: '2025-05-01', end_date: '2027-04-30', increment_percent: 3.5 },
  { id: 4, unit_id: 5, monthly_rent: 2900, rent_increment_mode: 'none', next_increment_due_date: null, status: 'active', start_date: '2026-02-01', end_date: '2027-01-31', increment_percent: 0 },
  { id: 5, unit_id: 7, monthly_rent: 1850, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2026-12-15', status: 'active', start_date: '2025-06-15', end_date: '2026-12-14', increment_percent: 3 },
  { id: 6, unit_id: 8, monthly_rent: 1950, rent_increment_mode: 'cpi', next_increment_due_date: '2027-02-01', status: 'active', start_date: '2025-02-01', end_date: '2027-01-31', increment_percent: null },
  { id: 7, unit_id: 10, monthly_rent: 2500, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2026-11-25', status: 'active', start_date: '2024-11-25', end_date: '2026-11-24', increment_percent: 5 },
  { id: 8, unit_id: 11, monthly_rent: 3400, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2027-03-01', status: 'active', start_date: '2025-03-01', end_date: '2027-02-28', increment_percent: 4 },
  { id: 9, unit_id: 12, monthly_rent: 3600, rent_increment_mode: 'none', next_increment_due_date: null, status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', increment_percent: 0 },
  { id: 10, unit_id: 14, monthly_rent: 3300, rent_increment_mode: 'cpi', next_increment_due_date: '2026-12-10', status: 'active', start_date: '2025-07-10', end_date: '2026-12-09', increment_percent: null },
  { id: 11, unit_id: 15, monthly_rent: 2200, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2026-11-22', status: 'active', start_date: '2025-05-22', end_date: '2026-11-21', increment_percent: 3.5 },
  { id: 12, unit_id: 16, monthly_rent: 2250, rent_increment_mode: 'none', next_increment_due_date: null, status: 'active', start_date: '2026-04-01', end_date: '2027-03-31', increment_percent: 0 },
  { id: 13, unit_id: 18, monthly_rent: 3050, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2027-01-05', status: 'active', start_date: '2025-01-05', end_date: '2027-01-04', increment_percent: 4 },
  { id: 14, unit_id: 19, monthly_rent: 2800, rent_increment_mode: 'cpi', next_increment_due_date: '2026-12-01', status: 'active', start_date: '2025-08-01', end_date: '2026-12-31', increment_percent: null },
  { id: 15, unit_id: 20, monthly_rent: 2850, rent_increment_mode: 'none', next_increment_due_date: null, status: 'active', start_date: '2026-06-01', end_date: '2027-05-31', increment_percent: 0 },
  { id: 16, unit_id: 22, monthly_rent: 4100, rent_increment_mode: 'fixed_percent', next_increment_due_date: '2027-04-01', status: 'active', start_date: '2025-04-01', end_date: '2027-03-31', increment_percent: 5 },
]

export const lease_tenants = [
  { lease_id: 1, user_id: 5, is_primary: true },
  { lease_id: 2, user_id: 6, is_primary: true },
  { lease_id: 3, user_id: 7, is_primary: true },
  { lease_id: 3, user_id: 8, is_primary: false },
  { lease_id: 4, user_id: 9, is_primary: true },
  { lease_id: 5, user_id: 10, is_primary: true },
  { lease_id: 6, user_id: 11, is_primary: true },
  { lease_id: 7, user_id: 12, is_primary: true },
  { lease_id: 8, user_id: 5, is_primary: true },
  { lease_id: 9, user_id: 6, is_primary: true },
  { lease_id: 10, user_id: 7, is_primary: true },
  { lease_id: 11, user_id: 8, is_primary: true },
  { lease_id: 12, user_id: 9, is_primary: true },
  { lease_id: 13, user_id: 10, is_primary: true },
  { lease_id: 14, user_id: 11, is_primary: true },
  { lease_id: 15, user_id: 12, is_primary: true },
  { lease_id: 16, user_id: 13, is_primary: true },
]

export const lease_rent_revisions = [
  { id: 1, lease_id: 1, monthly_rent: 2350, effective_from: '2025-12-01', effective_to: '2026-11-30' },
  { id: 2, lease_id: 3, monthly_rent: 2650, effective_from: '2025-05-01', effective_to: '2026-04-30' },
  { id: 3, lease_id: 5, monthly_rent: 1790, effective_from: '2025-06-15', effective_to: '2026-06-14' },
  { id: 4, lease_id: 7, monthly_rent: 2380, effective_from: '2024-11-25', effective_to: '2025-11-24' },
  { id: 5, lease_id: 8, monthly_rent: 3250, effective_from: '2025-03-01', effective_to: '2026-02-28' },
  { id: 6, lease_id: 11, monthly_rent: 2120, effective_from: '2025-05-22', effective_to: '2026-05-21' },
  { id: 7, lease_id: 13, monthly_rent: 2930, effective_from: '2025-01-05', effective_to: '2026-01-04' },
  { id: 8, lease_id: 16, monthly_rent: 3900, effective_from: '2025-04-01', effective_to: '2026-03-31' },
]

export const rent_increment_proposals = [
  { id: 1, lease_id: 1, proposed_rent: 2548, approved_rent: 2548, status: 'approved', created_at: '2026-10-02', decided_at: '2026-10-05' },
  { id: 2, lease_id: 3, proposed_rent: 2846, approved_rent: null, status: 'pending', created_at: '2026-10-18', decided_at: null },
  { id: 3, lease_id: 5, proposed_rent: 1906, approved_rent: null, status: 'pending', created_at: '2026-10-20', decided_at: null },
  { id: 4, lease_id: 7, proposed_rent: 2625, approved_rent: 2625, status: 'approved', created_at: '2026-09-14', decided_at: '2026-09-16' },
  { id: 5, lease_id: 8, proposed_rent: 3536, approved_rent: 3500, status: 'approved', created_at: '2026-09-28', decided_at: '2026-10-01' },
  { id: 6, lease_id: 10, proposed_rent: 3564, approved_rent: null, status: 'pending', created_at: '2026-10-22', decided_at: null },
  { id: 7, lease_id: 11, proposed_rent: 2278, approved_rent: null, status: 'rejected', created_at: '2026-08-30', decided_at: '2026-09-02' },
  { id: 8, lease_id: 14, proposed_rent: 2912, approved_rent: null, status: 'pending', created_at: '2026-10-24', decided_at: null },
]

// Rent charges for the current period, plus a few older ones for history.
export const rent_charges = [
  { id: 1, lease_id: 1, due_date: '2026-11-01', amount_due: 2548, status: 'paid' },
  { id: 2, lease_id: 2, due_date: '2026-11-01', amount_due: 2300, status: 'paid' },
  { id: 3, lease_id: 3, due_date: '2026-11-01', amount_due: 2846, status: 'pending' },
  { id: 4, lease_id: 4, due_date: '2026-11-01', amount_due: 2900, status: 'paid' },
  { id: 5, lease_id: 5, due_date: '2026-11-01', amount_due: 1906, status: 'overdue' },
  { id: 6, lease_id: 6, due_date: '2026-11-01', amount_due: 1950, status: 'paid' },
  { id: 7, lease_id: 7, due_date: '2026-11-01', amount_due: 2625, status: 'paid' },
  { id: 8, lease_id: 8, due_date: '2026-11-01', amount_due: 3536, status: 'paid' },
  { id: 9, lease_id: 9, due_date: '2026-11-01', amount_due: 3600, status: 'paid' },
  { id: 10, lease_id: 10, due_date: '2026-11-01', amount_due: 3300, status: 'pending' },
  { id: 11, lease_id: 11, due_date: '2026-11-01', amount_due: 2278, status: 'paid' },
  { id: 12, lease_id: 12, due_date: '2026-11-01', amount_due: 2250, status: 'paid' },
  { id: 13, lease_id: 13, due_date: '2026-11-01', amount_due: 3050, status: 'paid' },
  { id: 14, lease_id: 14, due_date: '2026-11-01', amount_due: 2912, status: 'overdue' },
  { id: 15, lease_id: 15, due_date: '2026-11-01', amount_due: 2850, status: 'pending' },
  { id: 16, lease_id: 16, due_date: '2026-11-01', amount_due: 4100, status: 'paid' },
  { id: 17, lease_id: 1, due_date: '2026-10-01', amount_due: 2450, status: 'paid' },
  { id: 18, lease_id: 3, due_date: '2026-10-01', amount_due: 2750, status: 'paid' },
  { id: 19, lease_id: 8, due_date: '2026-10-01', amount_due: 3400, status: 'paid' },
  { id: 20, lease_id: 11, due_date: '2026-10-01', amount_due: 2200, status: 'paid' },
]

export const payments = [
  { id: 1, rent_charge_id: 1, paid_by_user_id: 5, amount: 2548, status: 'completed', paid_at: '2026-10-28', method: 'Bank transfer' },
  { id: 2, rent_charge_id: 2, paid_by_user_id: 6, amount: 2300, status: 'completed', paid_at: '2026-10-30', method: 'Card' },
  { id: 3, rent_charge_id: 4, paid_by_user_id: 9, amount: 2900, status: 'completed', paid_at: '2026-10-29', method: 'Bank transfer' },
  { id: 4, rent_charge_id: 6, paid_by_user_id: 11, amount: 1950, status: 'completed', paid_at: '2026-10-27', method: 'Card' },
  { id: 5, rent_charge_id: 7, paid_by_user_id: 12, amount: 2625, status: 'completed', paid_at: '2026-10-26', method: 'Bank transfer' },
  { id: 6, rent_charge_id: 8, paid_by_user_id: 5, amount: 3536, status: 'completed', paid_at: '2026-10-31', method: 'Bank transfer' },
  { id: 7, rent_charge_id: 9, paid_by_user_id: 6, amount: 3600, status: 'completed', paid_at: '2026-10-31', method: 'Card' },
  { id: 8, rent_charge_id: 11, paid_by_user_id: 8, amount: 2278, status: 'completed', paid_at: '2026-10-25', method: 'Bank transfer' },
  { id: 9, rent_charge_id: 12, paid_by_user_id: 9, amount: 2250, status: 'completed', paid_at: '2026-10-24', method: 'Bank transfer' },
  { id: 10, rent_charge_id: 13, paid_by_user_id: 10, amount: 3050, status: 'completed', paid_at: '2026-10-30', method: 'Card' },
  { id: 11, rent_charge_id: 16, paid_by_user_id: 13, amount: 4100, status: 'completed', paid_at: '2026-10-29', method: 'Bank transfer' },
  { id: 12, rent_charge_id: 17, paid_by_user_id: 5, amount: 2450, status: 'completed', paid_at: '2026-09-29', method: 'Bank transfer' },
  { id: 13, rent_charge_id: 18, paid_by_user_id: 7, amount: 2750, status: 'completed', paid_at: '2026-09-30', method: 'Card' },
  { id: 14, rent_charge_id: 19, paid_by_user_id: 5, amount: 3400, status: 'completed', paid_at: '2026-09-30', method: 'Bank transfer' },
  { id: 15, rent_charge_id: 20, paid_by_user_id: 8, amount: 2200, status: 'completed', paid_at: '2026-09-27', method: 'Bank transfer' },
]

export const maintenance_requests = [
  { id: 1, unit_id: 6, title: 'Leaking kitchen faucet', description: 'Drip from the kitchen faucet has worsened over the weekend. Cabinet underside is damp.', priority: 'high', status: 'in_progress', created_by: 6, created_at: '2026-11-12', assigned_to: 3 },
  { id: 2, unit_id: 1, title: 'HVAC not cooling', description: 'AC runs but the unit does not cool below 78°F.', priority: 'high', status: 'open', created_by: 5, created_at: '2026-11-16', assigned_to: 3 },
  { id: 3, unit_id: 4, title: 'Broken dishwasher', description: 'Dishwasher stops mid-cycle and leaves water in the bottom.', priority: 'medium', status: 'open', created_by: 7, created_at: '2026-11-15', assigned_to: null },
  { id: 4, unit_id: 11, title: 'Window seal replacement', description: 'Condensation between the panes in the living room window.', priority: 'low', status: 'completed', created_by: 5, created_at: '2026-10-28', assigned_to: 3 },
  { id: 5, unit_id: 8, title: 'Loose balcony railing', description: 'Railing on the balcony feels loose near the corner post.', priority: 'high', status: 'in_progress', created_by: 11, created_at: '2026-11-10', assigned_to: 3 },
  { id: 6, unit_id: 19, title: 'Clogged bathroom drain', description: 'Slow drain in the primary bathroom sink.', priority: 'medium', status: 'open', created_by: 11, created_at: '2026-11-17', assigned_to: null },
  { id: 7, unit_id: 2, title: 'Paint touch-up', description: 'Scuff marks by the entryway need a touch-up.', priority: 'low', status: 'completed', created_by: 6, created_at: '2026-10-19', assigned_to: 3 },
  { id: 8, unit_id: 16, title: 'Smoke detector beeping', description: 'Intermittent chirping from the bedroom smoke detector.', priority: 'medium', status: 'open', created_by: 9, created_at: '2026-11-18', assigned_to: null },
]

export const maintenance_request_comments = [
  { id: 1, maintenance_request_id: 1, author_id: 3, body: 'Replacement cartridge ordered, arriving Thursday.', created_at: '2026-11-13' },
  { id: 2, maintenance_request_id: 1, author_id: 6, body: 'Thanks! I will be home after 5pm.', created_at: '2026-11-13' },
  { id: 3, maintenance_request_id: 2, author_id: 3, body: 'Technician scheduled for Wednesday morning.', created_at: '2026-11-17' },
  { id: 4, maintenance_request_id: 5, author_id: 3, body: 'On-site inspection completed, parts required.', created_at: '2026-11-12' },
]

export const roles = [
  { id: 1, organization_id: 1, name: 'Admin', is_system: true, description: 'Full access to the organization' },
  { id: 2, organization_id: 1, name: 'Property manager', is_system: true, description: 'Manages properties, units and leases' },
  { id: 3, organization_id: 1, name: 'Maintenance', is_system: true, description: 'Handles maintenance requests' },
  { id: 4, organization_id: 1, name: 'Accountant', is_system: true, description: 'Handles rent charges and payments' },
  { id: 5, organization_id: 1, name: 'Viewer', is_system: false, description: 'Read-only access' },
  { id: 6, organization_id: 2, name: 'Admin', is_system: true, description: 'Full access to the organization' },
]

export const permissions = [
  { id: 1, name: 'properties.view' }, { id: 2, name: 'properties.manage' },
  { id: 3, name: 'units.view' }, { id: 4, name: 'units.manage' },
  { id: 5, name: 'leases.view' }, { id: 6, name: 'leases.manage' },
  { id: 7, name: 'payments.view' }, { id: 8, name: 'payments.manage' },
  { id: 9, name: 'maintenance.view' }, { id: 10, name: 'maintenance.manage' },
  { id: 11, name: 'users.view' }, { id: 12, name: 'users.manage' },
  { id: 13, name: 'roles.view' }, { id: 14, name: 'roles.manage' },
  { id: 15, name: 'reports.view' },
]

export const model_has_role = [
  { role_id: 1, model_id: 1 }, { role_id: 2, model_id: 2 },
  { role_id: 3, model_id: 3 }, { role_id: 4, model_id: 4 },
  { role_id: 5, model_id: 5 }, { role_id: 5, model_id: 6 },
  { role_id: 5, model_id: 7 }, { role_id: 5, model_id: 8 },
  { role_id: 5, model_id: 9 }, { role_id: 5, model_id: 10 },
  { role_id: 5, model_id: 11 }, { role_id: 5, model_id: 12 },
  { role_id: 6, model_id: 13 },
]

export const role_has_permission = [
  { role_id: 1, permission_id: 1 }, { role_id: 1, permission_id: 2 }, { role_id: 1, permission_id: 3 }, { role_id: 1, permission_id: 4 },
  { role_id: 1, permission_id: 5 }, { role_id: 1, permission_id: 6 }, { role_id: 1, permission_id: 7 }, { role_id: 1, permission_id: 8 },
  { role_id: 1, permission_id: 9 }, { role_id: 1, permission_id: 10 }, { role_id: 1, permission_id: 11 }, { role_id: 1, permission_id: 12 },
  { role_id: 1, permission_id: 13 }, { role_id: 1, permission_id: 14 }, { role_id: 1, permission_id: 15 },
  { role_id: 2, permission_id: 1 }, { role_id: 2, permission_id: 2 }, { role_id: 2, permission_id: 3 }, { role_id: 2, permission_id: 4 },
  { role_id: 2, permission_id: 5 }, { role_id: 2, permission_id: 6 }, { role_id: 2, permission_id: 7 }, { role_id: 2, permission_id: 9 },
  { role_id: 2, permission_id: 10 }, { role_id: 2, permission_id: 11 }, { role_id: 2, permission_id: 15 },
  { role_id: 3, permission_id: 1 }, { role_id: 3, permission_id: 3 }, { role_id: 3, permission_id: 5 },
  { role_id: 3, permission_id: 9 }, { role_id: 3, permission_id: 10 },
  { role_id: 4, permission_id: 1 }, { role_id: 4, permission_id: 3 }, { role_id: 4, permission_id: 5 },
  { role_id: 4, permission_id: 7 }, { role_id: 4, permission_id: 8 }, { role_id: 4, permission_id: 15 },
  { role_id: 5, permission_id: 1 }, { role_id: 5, permission_id: 3 }, { role_id: 5, permission_id: 5 },
  { role_id: 5, permission_id: 7 }, { role_id: 5, permission_id: 9 }, { role_id: 5, permission_id: 11 },
  { role_id: 6, permission_id: 1 }, { role_id: 6, permission_id: 3 }, { role_id: 6, permission_id: 5 },
  { role_id: 6, permission_id: 7 }, { role_id: 6, permission_id: 9 }, { role_id: 6, permission_id: 11 },
  { role_id: 6, permission_id: 13 }, { role_id: 6, permission_id: 15 },
]

export const personal_access_tokens = [
  { id: 1, tokenable_id: 1, name: 'Mobile app', token: 'zq_live_•••••••••••••4f2a', created_at: '2026-08-12', last_used_at: '2026-11-18' },
  { id: 2, tokenable_id: 2, name: 'Reporting sync', token: 'zq_live_•••••••••••••9b71', created_at: '2026-07-03', last_used_at: '2026-11-01' },
  { id: 3, tokenable_id: 4, name: 'Accounting export', token: 'zq_live_•••••••••••••c0d8', created_at: '2026-09-21', last_used_at: '2026-10-30' },
]

export function createSeedState() {
  return {
    organizations: structuredClone(organizations),
    users: structuredClone(users),
    properties: structuredClone(properties),
    units: structuredClone(units),
    leases: structuredClone(leases),
    lease_tenants: structuredClone(lease_tenants),
    lease_rent_revisions: structuredClone(lease_rent_revisions),
    rent_increment_proposals: structuredClone(rent_increment_proposals),
    rent_charges: structuredClone(rent_charges),
    payments: structuredClone(payments),
    maintenance_requests: structuredClone(maintenance_requests),
    maintenance_request_comments: structuredClone(maintenance_request_comments),
    roles: structuredClone(roles),
    permissions: structuredClone(permissions),
    model_has_role: structuredClone(model_has_role),
    role_has_permission: structuredClone(role_has_permission),
    personal_access_tokens: structuredClone(personal_access_tokens),
    activeOrganizationId: 1,
  }
}
