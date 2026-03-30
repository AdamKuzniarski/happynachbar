-- CreateTable
CREATE TABLE "ActivityLike" (
    "id" UUID NOT NULL,
    "activityId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLike_activityId_createdAt_idx" ON "ActivityLike"("activityId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLike_userId_createdAt_idx" ON "ActivityLike"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLike_activityId_userId_key" ON "ActivityLike"("activityId", "userId");

-- AddForeignKey
ALTER TABLE "ActivityLike" ADD CONSTRAINT "ActivityLike_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLike" ADD CONSTRAINT "ActivityLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
