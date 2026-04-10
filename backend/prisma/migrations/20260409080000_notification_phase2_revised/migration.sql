-- Notification phase 2 clean migration
-- - recipient state per user
-- - seen/read stored in database
-- - broadcast kept separate by Notification.type = 'BROADCAST'
-- - push subscription table

ALTER TABLE "NotificationRecipient" ADD COLUMN IF NOT EXISTS "userId" INTEGER;
ALTER TABLE "NotificationRecipient" ADD COLUMN IF NOT EXISTS "roleSnapshot" "Role";
ALTER TABLE "NotificationRecipient" ADD COLUMN IF NOT EXISTS "isSeen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NotificationRecipient" ADD COLUMN IF NOT EXISTS "seenAt" TIMESTAMP(3);

UPDATE "NotificationRecipient" nr
SET "roleSnapshot" = COALESCE(nr."roleSnapshot", nr."role")
WHERE nr."roleSnapshot" IS NULL;

UPDATE "NotificationRecipient" nr
SET "userId" = u."id_user"
FROM "User" u
WHERE nr."userId" IS NULL
  AND nr."roleSnapshot" = u."role";

DELETE FROM "NotificationRecipient"
WHERE "userId" IS NULL;

ALTER TABLE "NotificationRecipient" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "NotificationRecipient" ALTER COLUMN "roleSnapshot" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'NotificationRecipient_notificationId_role_key'
  ) THEN
    DROP INDEX "NotificationRecipient_notificationId_role_key";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'NotificationRecipient_role_isRead_idx'
  ) THEN
    DROP INDEX "NotificationRecipient_role_isRead_idx";
  END IF;
END $$;

ALTER TABLE "NotificationRecipient" DROP CONSTRAINT IF EXISTS "NotificationRecipient_userId_fkey";
ALTER TABLE "NotificationRecipient"
  ADD CONSTRAINT "NotificationRecipient_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id_user")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationRecipient" DROP COLUMN IF EXISTS "role";

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRecipient_notificationId_userId_key"
  ON "NotificationRecipient"("notificationId", "userId");

CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isRead_idx"
  ON "NotificationRecipient"("userId", "isRead");

CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isSeen_idx"
  ON "NotificationRecipient"("userId", "isSeen");

CREATE INDEX IF NOT EXISTS "Notification_type_createdAt_idx"
  ON "Notification"("type", "createdAt");

CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "userAgent" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key"
  ON "PushSubscription"("endpoint");

CREATE INDEX IF NOT EXISTS "PushSubscription_userId_isActive_idx"
  ON "PushSubscription"("userId", "isActive");

ALTER TABLE "PushSubscription" DROP CONSTRAINT IF EXISTS "PushSubscription_userId_fkey";
ALTER TABLE "PushSubscription"
  ADD CONSTRAINT "PushSubscription_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id_user")
  ON DELETE CASCADE ON UPDATE CASCADE;
