import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import { BaseEmailTemplate } from './components/BaseEmailTemplate';

export const EnrollmentWelcomeEmail = ({
  studentName = '',
  testPackName = '',
  validityPeriod = '',
  loginUrl = '',
  dashboardUrl = '',
}) => {
  const previewText = `Welcome to ${testPackName}! Your enrollment is confirmed.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <BaseEmailTemplate>
        <Container className="p-8 mx-auto">
          <Heading className="text-2xl font-bold mb-4">
            Welcome to {testPackName}!
          </Heading>

          <Text className="mb-4">Dear {studentName},</Text>

          <Text className="mb-4">
            Thank you for enrolling in {testPackName}. We're excited to have you
            on board and help you achieve your learning goals. Your enrollment
            is now active and valid for {validityPeriod}.
          </Text>

          <Text className="mb-4">Here's what you need to know:</Text>

          <Container className="mb-4 ml-4">
            <Text className="mb-2">• Your enrollment is active from today</Text>
            <Text className="mb-2">• Access period: {validityPeriod}</Text>
            <Text className="mb-2">
              • You can access all course materials immediately
            </Text>
            <Text className="mb-2">
              • Track your progress in your dashboard
            </Text>
          </Container>

          <Text className="mb-4">To get started:</Text>

          <Container className="mb-6">
            <Link
              href={loginUrl}
              className="bg-blue-500 text-white py-3 px-4 rounded"
            >
              Login to Your Account
            </Link>
          </Container>

          <Container className="mb-6">
            <Link
              href={dashboardUrl}
              className="bg-green-500 text-white py-3 px-4 rounded"
            >
              Go to Dashboard
            </Link>
          </Container>

          <Text className="text-gray-500 text-sm mt-8">
            If you need any assistance, please don't hesitate to contact our
            support team.
          </Text>
        </Container>
      </BaseEmailTemplate>
    </Html>
  );
};

export default EnrollmentWelcomeEmail;
