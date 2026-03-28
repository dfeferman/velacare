# Velacare — Implementierungs-Roadmap

> Zuletzt aktualisiert: 2026-03-28
> Prinzip: Alle Phasen vollständig planen, bevor die Implementierung beginnt.

---

## Übersicht

| Phase | Thema | Spec | Plan | Code |
|---|---|---|---|---|
| 1 | Foundation (Supabase, Prisma, Auth, Middleware) | ✅ | ✅ | ⏳ |
| 2 | Echter Funnel (v2 UI + Signup + DB-Writes) | ✅ | ✅ | ⏳ |
| 3 | Kundenportal (echte Daten statt Mock) | ✅ | ✅ | — |
| 4 | Admin-Panel (echte Daten statt Mock) | ✅ | ✅ | — |
| 5 | E-Mail & Jobs (Resend, pg_cron) | — | — | — |
| 6 | Sicherheit & DSGVO (Encryption, AuditLog, MFA) | — | — | — |

**Legende:** ✅ fertig · ⏳ in Arbeit / als nächstes · — noch nicht begonnen

---

## Dokumente

### Phase 1 — Foundation
- Spec: `docs/superpowers/specs/2026-03-27-velacare-phase1-foundation-design.md`
- Plan: `docs/superpowers/plans/2026-03-27-phase1-foundation.md`

### Phase 2 — Echter Funnel
- Spec: `docs/superpowers/specs/2026-03-27-velacare-phase2-funnel-design.md`
- Plan: `docs/superpowers/plans/2026-03-28-phase2-funnel.md`

### Phase 3 — Kundenportal
- Spec: `docs/superpowers/specs/2026-03-28-velacare-phase3-kundenportal-design.md`
- Plan: `docs/superpowers/plans/2026-03-28-phase3-kundenportal.md`

### Phase 4 — Admin
- Spec: `docs/superpowers/specs/2026-03-28-velacare-phase4-admin-design.md`
- Plan: `docs/superpowers/plans/2026-03-28-phase4-admin.md`

### Phase 5 — E-Mail & Jobs
- Spec: —
- Plan: —

### Phase 6 — Sicherheit & DSGVO
- Spec: —
- Plan: —

---

## Notizen für später

- **Phase 5:** Magic Link / Passwordless als Ablösung des Passwort-Felds im Funnel
- **Phase 5:** Resend + eigene E-Mail-Templates mit Velacare-Branding
- **Phase 6:** Application-level Encryption (vorname, nachname, geburtsdatum, pflegegrad)
- **Phase 6:** AuditLog INSERT-only mit separatem DB-Nutzer
- **Phase 6:** MFA für Admin-Accounts
- **Phase 6:** Compensation-Logik für Partial-Failure in registerKunde()
- **Spätere Phase:** Digitale Unterschrift (Canvas-Pad) in Funnel Step 3
