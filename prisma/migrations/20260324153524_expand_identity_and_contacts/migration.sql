-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "greeting" TEXT,
ADD COLUMN     "insideJokes" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "topics" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avoidTopics" TEXT,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "major" TEXT,
ADD COLUMN     "speechStyle" TEXT,
ADD COLUMN     "topics" TEXT,
ADD COLUMN     "year" TEXT;
