// src/emails/_components/email-layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import type { ReactNode } from 'react'

interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

const brand = {
  terra: '#C96B3F',
  dark: '#2C2420',
  bg: '#F5F0EB',
  warmWhite: '#FDFAF7',
  warmGray: '#8A8078',
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily: 'DM Sans, sans-serif' }}>
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: brand.warmWhite,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Section style={{ backgroundColor: brand.terra, padding: '24px 32px' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                letterSpacing: '0.02em',
              }}
            >
              Velacare
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: '32px' }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ borderColor: brand.bg, margin: 0 }} />
          <Section style={{ padding: '20px 32px', backgroundColor: brand.bg }}>
            <Text
              style={{ color: brand.warmGray, fontSize: '12px', margin: 0, lineHeight: '1.6' }}
            >
              Velacare GmbH · Musterstraße 1 · 10115 Berlin
              <br />
              Du erhältst diese E-Mail, weil du dich bei Velacare registriert hast.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
