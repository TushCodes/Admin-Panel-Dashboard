-- CreateTable
CREATE TABLE "consignments" (
    "consignment_num" VARCHAR(16) NOT NULL,
    "status" VARCHAR(50),
    "pickup_address" TEXT,
    "pickup_pincode" VARCHAR(20),
    "pickup_tag" VARCHAR(100),
    "pickup_date" DATE,
    "drop_address" TEXT,
    "drop_pincode" VARCHAR(20),
    "drop_tag" VARCHAR(100),
    "drop_date" DATE,

    CONSTRAINT "consignments_pkey" PRIMARY KEY ("consignment_num")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_metrics" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "period" DATE,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consignments_pickup_pincode_idx" ON "consignments"("pickup_pincode");

-- CreateIndex
CREATE INDEX "consignments_drop_pincode_idx" ON "consignments"("drop_pincode");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "dashboard_metrics_name_idx" ON "dashboard_metrics"("name");
