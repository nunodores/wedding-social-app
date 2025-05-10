/*
  # Create Test Data

  1. Test Data
    - Create a test wedding event with password 'event2025'
    - Create a test user with email 'test@example.com' and password 'test'
*/

-- Insert test wedding event
INSERT INTO wedding_events (id, name, slug, access_code, hashed_password, created_at)
VALUES (
  'e385b9c7-4a6e-4347-9c64-f7f55851a8d5',
  'Test Wedding',
  'test-wedding',
  'event2025',
  '$2a$12$K8GpYeKMuLkJqPvq.hqFz.x9gHWW3zM5YFvs7LEZ.Ux/qgXu4Qj6.',
  NOW()
);

-- Insert test guest
INSERT INTO guests (id, name, email, wedding_event_id, created_at)
VALUES (
  'f7d9a8b3-2c1e-4d6f-9e8a-5b4c3d2a1f0e',
  'Test User',
  'test@example.com',
  'e385b9c7-4a6e-4347-9c64-f7f55851a8d5',
  NOW()
);