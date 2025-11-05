-- ENG-328: Fix support_messages table schema
-- Rename is_staff to is_admin_reply to match API usage

-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- Step 1: Create new table with correct column name
CREATE TABLE support_messages_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER,
    is_admin_reply BOOLEAN DEFAULT 0,
    message TEXT NOT NULL,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data
INSERT INTO support_messages_new (id, ticket_id, user_id, is_admin_reply, message, attachments, created_at)
SELECT id, ticket_id, user_id, is_staff, message, attachments, created_at
FROM support_messages;

-- Step 3: Drop old table
DROP TABLE support_messages;

-- Step 4: Rename new table
ALTER TABLE support_messages_new RENAME TO support_messages;

-- Step 5: Create indexes for performance
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);
