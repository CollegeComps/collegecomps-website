-- Support Ticket System Database Schema

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  
  -- Ticket details
  subject TEXT NOT NULL,
  category TEXT NOT NULL, -- 'technical', 'billing', 'feature_request', 'general'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'
  
  -- Content
  description TEXT NOT NULL,
  attachments TEXT, -- JSON array of attachment URLs
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  first_response_at DATETIME,
  
  -- Assignment
  assigned_to TEXT, -- Admin/support agent email
  
  -- Tracking
  response_count INTEGER DEFAULT 0,
  last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create support_messages table for ticket thread
CREATE TABLE IF NOT EXISTS support_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER, -- NULL if from support team
  is_staff BOOLEAN DEFAULT 0,
  
  message TEXT NOT NULL,
  attachments TEXT, -- JSON array
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tier ON support_tickets(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

-- Create support_categories reference table
CREATE TABLE IF NOT EXISTS support_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT OR IGNORE INTO support_categories (name, description, display_order) VALUES
('technical', 'Technical issues and bugs', 1),
('billing', 'Billing and subscription questions', 2),
('feature_request', 'Feature requests and suggestions', 3),
('account', 'Account and profile issues', 4),
('data', 'Data accuracy and updates', 5),
('general', 'General inquiries', 6);
