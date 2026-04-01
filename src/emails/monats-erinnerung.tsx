// src/emails/monats-erinnerung.tsx
import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout } from './_components/email-layout'

interface MonatsErinnerungEmailProps {
  vorname: string
  monat: string       // z.B. "April 2026"
  kontoUrl: string
}

export function MonatsErinnerungEmail({
  vorname,
  monat,
  kontoUrl,
}: MonatsErinnerungEmailProps) {
  return (
    <EmailLayout preview={`Deine Pflegehilfsmittel für ${monat} sind noch verfügbar`}>
      <Heading
        style={{
          fontSize: '24px',
          color: '#2C2420',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          marginTop: 0,
        }}
      >
        Dein Budget für {monat} wartet
      </Heading>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        Hallo {vorname},
      </Text>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        dein monatliches Budget für Pflegehilfsmittel über deine Pflegekasse steht für{' '}
        <strong>{monat}</strong> bereit — bis zu 42 € werden erstattet. Du hast für
        diesen Monat noch keine Lieferung bestellt.
      </Text>

      <Section
        style={{
          backgroundColor: '#F5F0EB',
          borderRadius: '8px',
          padding: '16px 20px',
          margin: '24px 0',
        }}
      >
        <Text
          style={{ color: '#2C2420', fontSize: '15px', margin: '0 0 4px 0', fontWeight: '600' }}
        >
          Nicht vergessen: Das Budget verfällt am Monatsende.
        </Text>
        <Text style={{ color: '#8A8078', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Nicht genutzte Leistungen können nicht in den Folgemonat übertragen werden.
        </Text>
      </Section>

      <Button
        href={kontoUrl}
        style={{
          backgroundColor: '#C96B3F',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Jetzt Box bestellen →
      </Button>
    </EmailLayout>
  )
}

export default MonatsErinnerungEmail
