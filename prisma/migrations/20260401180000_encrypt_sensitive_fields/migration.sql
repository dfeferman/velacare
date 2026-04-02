-- AlterTable: change geburtsdatum from DATE to TEXT and pflegegrad from INTEGER to TEXT
-- Both fields now store AES-256-GCM ciphertext (format: iv_hex.authtag_hex.ciphertext_hex)

ALTER TABLE "kunden_profile" ALTER COLUMN "geburtsdatum" TYPE TEXT USING "geburtsdatum"::TEXT;
ALTER TABLE "kunden_profile" ALTER COLUMN "pflegegrad" TYPE TEXT USING "pflegegrad"::TEXT;
