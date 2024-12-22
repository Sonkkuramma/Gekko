import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

export default function BaseEmailTemplate({ preview, heading, children }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            {/* Add your logo here */}
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              alt="Logo"
              width="120"
              height="40"
            />
          </Section>

          <Section style={styles.contentSection}>
            {heading && <Text style={styles.heading}>{heading}</Text>}

            {children}
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="#" style={styles.link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href="#" style={styles.link}>
                Terms of Service
              </Link>
              {' • '}
              <Link href="#" style={styles.link}>
                Contact Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, "Segoe UI", sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '560px',
  },
  logoSection: {
    padding: '20px',
    textAlign: 'center',
  },
  contentSection: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '5px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    textAlign: 'center',
  },
  divider: {
    borderTop: '1px solid #e6e6e6',
    margin: '32px 0',
  },
  footer: {
    textAlign: 'center',
    padding: '0 20px',
  },
  footerText: {
    fontSize: '12px',
    color: '#666666',
    marginBottom: '12px',
  },
  footerLinks: {
    fontSize: '12px',
    color: '#666666',
  },
  link: {
    color: '#10b981',
    textDecoration: 'none',
  },
};
