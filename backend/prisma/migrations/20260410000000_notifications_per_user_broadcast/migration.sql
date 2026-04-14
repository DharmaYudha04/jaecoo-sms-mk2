ALTER TABLE "NotificationRecipient"
  ADD COLUMN IF NOT EXISTS "userId" INTEGER,
  ADD COLUMN IF NOT EXISTS "roleSnapshot" "Role";

UPDATE "NotificationRecipient" nr
SET "roleSnapshot" = COALESCE(nr."roleSnapshot", nr."role")
WHERE nr."roleSnapshot" IS NULL;

INSERT INTO "NotificationRecipient" ("notificationId", "userId", "roleSnapshot", "isRead", "readAt")
SELECT nr."notificationId", u."id_user", COALESCE(nr."roleSnapshot", nr."role"), nr."isRead", nr."readAt"
FROM "NotificationRecipient" nr
JOIN "User" u ON u."role" = COALESCE(nr."roleSnapshot", nr."role")
WHERE nr."userId" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "NotificationRecipient" existing
    WHERE existing."notificationId" = nr."notificationId"
      AND existing."userId" = u."id_user"
  );

DELETE FROM "NotificationRecipient"
WHERE "userId" IS NULL;

ALTER TABLE "NotificationRecipient"
  ALTER COLUMN "userId" SET NOT NULL,
  ALTER COLUMN "roleSnapshot" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'NotificationRecipient_userId_fkey'
  ) THEN
    ALTER TABLE "NotificationRecipient"
      ADD CONSTRAINT "NotificationRecipient_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id_user")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS "NotificationRecipient_role_isRead_idx";
DROP INDEX IF EXISTS "NotificationRecipient_notificationId_role_key";
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRecipient_notificationId_userId_key"
  ON "NotificationRecipient"("notificationId", "userId");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isRead_idx"
  ON "NotificationRecipient"("userId", "isRead");

ALTER TABLE "NotificationRecipient"
  DROP COLUMN IF EXISTS "role";
