-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT,
    "price" DOUBLE PRECISION,
    "inventoryQuantity" INTEGER,
    "inventoryPolicy" TEXT,
    "fulfillmentService" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."store_info" (
    "id" TEXT NOT NULL,
    "store_info_tenant_id_key" TEXT NOT NULL,
    "name" TEXT,
    "domain" TEXT,
    "myshopifyDomain" TEXT,
    "planName" TEXT,
    "shopOwner" TEXT,
    "email" TEXT,
    "currency" TEXT,
    "country" TEXT,
    "province" TEXT,
    "city" TEXT,
    "address1" TEXT,
    "zip" TEXT,
    "phone" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abandoned_carts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION,
    "subtotalPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."store_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT,
    "verb" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "customerId" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "subtotalPrice" DOUBLE PRECISION,
    "totalTax" DOUBLE PRECISION,
    "totalDiscounts" DOUBLE PRECISION,
    "financialStatus" TEXT,
    "fulfillmentStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "title" TEXT,
    "variantTitle" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "linePrice" DOUBLE PRECISION,
    "sku" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_addresses" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "addressType" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "zip" TEXT,
    "phone" TEXT,

    CONSTRAINT "order_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "public"."tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_apiKey_key" ON "public"."tenants"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shopifyId_key" ON "public"."customers"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shopifyId_tenantId_key" ON "public"."customers"("shopifyId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "products_shopifyId_key" ON "public"."products"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "products_shopifyId_tenantId_key" ON "public"."products"("shopifyId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "store_info_store_info_tenant_id_key_key" ON "public"."store_info"("store_info_tenant_id_key");

-- CreateIndex
CREATE UNIQUE INDEX "store_info_tenantid_unique" ON "public"."store_info"("store_info_tenant_id_key");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_checkoutId_key" ON "public"."abandoned_carts"("checkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_checkoutId_tenantId_key" ON "public"."abandoned_carts"("checkoutId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "store_events_eventId_key" ON "public"."store_events"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "store_events_eventId_tenantId_key" ON "public"."store_events"("eventId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyId_key" ON "public"."orders"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyId_tenantId_key" ON "public"."orders"("shopifyId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_orderId_productId_key" ON "public"."order_items"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "order_addresses_orderId_addressType_key" ON "public"."order_addresses"("orderId", "addressType");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_info" ADD CONSTRAINT "store_info_store_info_tenant_id_key_fkey" FOREIGN KEY ("store_info_tenant_id_key") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abandoned_carts" ADD CONSTRAINT "abandoned_carts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."store_events" ADD CONSTRAINT "store_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("shopifyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_addresses" ADD CONSTRAINT "order_addresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
