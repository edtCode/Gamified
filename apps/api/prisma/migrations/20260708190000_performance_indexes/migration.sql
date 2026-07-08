-- Add composite indexes for the production query shapes used by leaderboards,
-- mentor matching, message threads, and notification feeds.
CREATE INDEX "User_collegeId_batch_xp_createdAt_idx" ON "User"("collegeId", "batch", "xp", "createdAt");
CREATE INDEX "User_collegeId_level_xp_idx" ON "User"("collegeId", "level", "xp");
CREATE INDEX "Message_fromUserId_toUserId_createdAt_idx" ON "Message"("fromUserId", "toUserId", "createdAt");
CREATE INDEX "Message_toUserId_fromUserId_createdAt_idx" ON "Message"("toUserId", "fromUserId", "createdAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
