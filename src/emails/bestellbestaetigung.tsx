// src/emails/bestellbestaetigung.tsx
import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import { EmailLayout } from './_components/email-layout'

interface BestellbestaetigungEmailProps {
  vorname: string
  nachname: string
  pflegegrad: number
  budgetGenutzt: number  // in Cent
  magicLinkUrl: string   // Einmallink zum ersten Konto-Login
  expiresInMinutes?: number
}

export function BestellbestaetigungEmail({
  vorname,
  nachname,
  pflegegrad,
  budgetGenutzt,
  magicLinkUrl,
  expiresInMinutes = 60,
}: BestellbestaetigungEmailProps) {
  const budgetEuro = (budgetGenutzt / 100).toFixed(2).replace('.', ',')

  return (
    <EmailLayout preview={`Dein Antrag ist eingegangen, ${vorname}!`}>
      <Heading
        style={{
          fontSize: '24px',
          color: '#2C2420',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          marginTop: 0,
        }}
      >
        Dein Antrag ist eingegangen!
      </Heading>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        Hallo {vorname} {nachname},
      </Text>

      <Text style={{ color: '#2C2420', fontSize: '16px', lineHeight: '1.6' }}>
        wir haben deinen Antrag auf eine Pflegehilfsmittel-Box (Pflegegrad {pflegegrad})
        erfolgreich erhalten. Deine ausgewählten Produkte im Wert von{' '}
        <strong>{budgetEuro} €</strong> werden von deiner Pflegekasse übernommen.
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
          Was passiert als nächstes?
        </Text>
        <Text style={{ color: '#8A8078', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Wir prüfen deinen Antrag und leiten ihn an deine Pflegekasse weiter.
          Das dauert in der Regel 2–5 Werktage. Du erhältst eine Benachrichtigung,
          sobald deine Box auf dem Weg ist.
        </Text>
      </Section>

      <Hr style={{ borderColor: '#E8E0D8', margin: '28px 0' }} />

      <Text
        style={{ color: '#2C2420', fontSize: '15px', fontWeight: '600', margin: '0 0 8px 0' }}
      >
        Dein Konto ist bereit
      </Text>
      <Text style={{ color: '#8A8078', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
        Klicke auf den Button, um deinen Antrag zu verfolgen. Der Link ist{' '}
        {expiresInMinutes} Minuten gültig.
      </Text>

      <Button
        href={magicLinkUrl}
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
        Antrag verfolgen →
      </Button>

      <Text
        style={{ color: '#8A8078', fontSize: '12px', lineHeight: '1.5', marginTop: '20px' }}
      >
        Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
        <br />
        <span style={{ color: '#C96B3F', wordBreak: 'break-all' }}>{magicLinkUrl}</span>
      </Text>
    </EmailLayout>
  )
}

export default BestellbestaetigungEmail
