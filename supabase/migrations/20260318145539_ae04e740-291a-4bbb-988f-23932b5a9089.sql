-- Performance indexes for scale (30k members/community target)

CREATE INDEX IF NOT EXISTS idx_community_members_community_approved
ON public.community_members (community_id, is_approved, role);

CREATE INDEX IF NOT EXISTS idx_community_members_user_approved
ON public.community_members (user_id, is_approved);

CREATE INDEX IF NOT EXISTS idx_community_members_community_joined
ON public.community_members (community_id, is_approved, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_community_feed
ON public.posts (community_id, is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_community_updated
ON public.conversations (community_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user
ON public.conversation_participants (user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conv_participants_conv
ON public.conversation_participants (conversation_id, user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON public.messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_unread
ON public.messages (conversation_id, is_read, sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_community_published
ON public.courses (community_id, is_published, order_index);

CREATE INDEX IF NOT EXISTS idx_events_community_start
ON public.events (community_id, start_time);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_user_post
ON public.post_likes (user_id, post_id);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_post
ON public.post_bookmarks (user_id, post_id);