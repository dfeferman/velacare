-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('kunde', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('aktiv', 'gesperrt', 'geloescht', 'ausstehend');

-- CreateEnum
CREATE TYPE "ProduktKategorie" AS ENUM ('handschuhe', 'desinfektion', 'mundschutz', 'schutzkleidung', 'hygiene', 'sonstiges');

-- CreateEnum
CREATE TYPE "LieferungStatus" AS ENUM ('geplant', 'in_bearbeitung', 'versendet', 'zugestellt', 'storniert');

-- CreateEnum
CREATE TYPE "KundeDeliveryStatus" AS ENUM ('aktiv', 'pausiert', 'gesperrt');

-- CreateEnum
CREATE TYPE "AnfrageKategorie" AS ENUM ('box', 'lieferung', 'adresse', 'loeschung', 'sonstiges');

-- CreateEnum
CREATE TYPE "AnfrageStatus" AS ENUM ('offen', 'in_bearbeitung', 'beantwortet', 'geschlossen');

-- CreateEnum
CREATE TYPE "EinwilligungTyp" AS ENUM ('dsgvo', 'agb', 'marketing');

-- CreateEnum
CREATE TYPE "BenachrichtigungTyp" AS ENUM ('lieferung_status', 'anfrage_beantwortet', 'system');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "rolle" "Rolle" NOT NULL DEFAULT 'kunde',
    "status" "UserStatus" NOT NULL DEFAULT 'ausstehend',
    "email_bestaetigt" BOOLEAN NOT NULL DEFAULT false,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letzter_login" TIMESTAMP(3),
    "loeschung_beantragt_am" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kunden_profile" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vorname" VARCHAR(100) NOT NULL,
    "nachname" VARCHAR(100) NOT NULL,
    "geburtsdatum" DATE NOT NULL,
    "pflegegrad" INTEGER NOT NULL,
    "krankenkasse" VARCHAR(200) NOT NULL,
    "telefon" VARCHAR(30) NOT NULL,
    "strasse" VARCHAR(200) NOT NULL,
    "plz" VARCHAR(10) NOT NULL,
    "ort" VARCHAR(100) NOT NULL,
    "angehoeriger_name" VARCHAR(200),
    "angehoeriger_verhaeltnis" VARCHAR(100),
    "lieferstichtag" INTEGER NOT NULL,
    "lieferung_status" "KundeDeliveryStatus" NOT NULL DEFAULT 'aktiv',
    "pausiert_bis" DATE,

    CONSTRAINT "kunden_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produkte" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "kategorie" "ProduktKategorie" NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "bild_url" TEXT NOT NULL,
    "preis" DECIMAL(8,2) NOT NULL,
    "varianten" JSONB,
    "hersteller" VARCHAR(100) NOT NULL,
    "pflichtkennzeichnung" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "sortierung" INTEGER NOT NULL DEFAULT 0,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produkte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_konfigurationen" (
    "id" UUID NOT NULL,
    "kunde_id" UUID NOT NULL,
    "produkte" JSONB NOT NULL,
    "gesamtpreis" DECIMAL(8,2) NOT NULL,
    "geaendert_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendert_von" UUID,

    CONSTRAINT "box_konfigurationen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_konfigurationen_verlauf" (
    "id" UUID NOT NULL,
    "kunde_id" UUID NOT NULL,
    "produkte" JSONB NOT NULL,
    "gesamtpreis" DECIMAL(8,2) NOT NULL,
    "geaendert_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendert_von" UUID,

    CONSTRAINT "box_konfigurationen_verlauf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lieferungen" (
    "id" UUID NOT NULL,
    "kunde_id" UUID NOT NULL,
    "geplant_fuer" DATE NOT NULL,
    "status" "LieferungStatus" NOT NULL DEFAULT 'geplant',
    "box_snapshot" JSONB NOT NULL,
    "tracking_nummer" TEXT,
    "notizen" TEXT,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lieferungen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anfragen" (
    "id" UUID NOT NULL,
    "kunde_id" UUID NOT NULL,
    "kategorie" "AnfrageKategorie" NOT NULL,
    "betreff" VARCHAR(200) NOT NULL,
    "nachricht" TEXT NOT NULL,
    "antwort" TEXT,
    "beantwortet_von" UUID,
    "status" "AnfrageStatus" NOT NULL DEFAULT 'offen',
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beantwortet_am" TIMESTAMP(3),

    CONSTRAINT "anfragen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "einwilligungen" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "typ" "EinwilligungTyp" NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "zeitpunkt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_adresse" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "widerruf_am" TIMESTAMP(3),

    CONSTRAINT "einwilligungen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benachrichtigungen" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "typ" "BenachrichtigungTyp" NOT NULL,
    "titel" VARCHAR(200) NOT NULL,
    "gelesen" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benachrichtigungen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "aktion" VARCHAR(100) NOT NULL,
    "entitaet" VARCHAR(50) NOT NULL,
    "entitaet_id" UUID NOT NULL,
    "alt_wert" JSONB,
    "neu_wert" JSONB,
    "ip_adresse" VARCHAR(45) NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kunden_profile_user_id_key" ON "kunden_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "box_konfigurationen_kunde_id_key" ON "box_konfigurationen"("kunde_id");

-- CreateIndex
CREATE INDEX "box_konfigurationen_verlauf_kunde_id_idx" ON "box_konfigurationen_verlauf"("kunde_id");

-- CreateIndex
CREATE INDEX "lieferungen_kunde_id_idx" ON "lieferungen"("kunde_id");

-- CreateIndex
CREATE INDEX "lieferungen_geplant_fuer_idx" ON "lieferungen"("geplant_fuer");

-- CreateIndex
CREATE INDEX "anfragen_kunde_id_idx" ON "anfragen"("kunde_id");

-- CreateIndex
CREATE INDEX "einwilligungen_user_id_idx" ON "einwilligungen"("user_id");

-- CreateIndex
CREATE INDEX "benachrichtigungen_user_id_idx" ON "benachrichtigungen"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entitaet_entitaet_id_idx" ON "audit_log"("entitaet", "entitaet_id");

-- AddForeignKey
ALTER TABLE "kunden_profile" ADD CONSTRAINT "kunden_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_konfigurationen" ADD CONSTRAINT "box_konfigurationen_kunde_id_fkey" FOREIGN KEY ("kunde_id") REFERENCES "kunden_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_konfigurationen_verlauf" ADD CONSTRAINT "box_konfigurationen_verlauf_kunde_id_fkey" FOREIGN KEY ("kunde_id") REFERENCES "kunden_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lieferungen" ADD CONSTRAINT "lieferungen_kunde_id_fkey" FOREIGN KEY ("kunde_id") REFERENCES "kunden_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anfragen" ADD CONSTRAINT "anfragen_kunde_id_fkey" FOREIGN KEY ("kunde_id") REFERENCES "kunden_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "einwilligungen" ADD CONSTRAINT "einwilligungen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benachrichtigungen" ADD CONSTRAINT "benachrichtigungen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
