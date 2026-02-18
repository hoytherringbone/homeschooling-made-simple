-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "category" TEXT;

-- CreateTable
CREATE TABLE "SubjectWeight" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubjectWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectWeight_subjectId_category_key" ON "SubjectWeight"("subjectId", "category");

-- AddForeignKey
ALTER TABLE "SubjectWeight" ADD CONSTRAINT "SubjectWeight_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
