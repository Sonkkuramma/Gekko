import { createTransport } from 'nodemailer';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail';
import EnrollmentWelcomeEmail from '@/emails/EnrollmentWelcomeEmail';
import RefundConfirmationEmail from '@/emails/RefundConfirmationEmail';
import { db } from '@/lib/db';

class EmailService {
  constructor() {
    if (EmailService.instance) {
      return EmailService.instance;
    }

    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    EmailService.instance = this;
  }

  async sendOrderConfirmation(order, user) {
    try {
      const emailHtml = render(
        OrderConfirmationEmail({
          orderNumber: order.id,
          customerName: user.fullName,
          orderDate: new Date(order.created_at).toLocaleDateString(),
          items: order.items,
          total: order.total_amount,
          paymentId: order.razorpay_payment_id,
        })
      );

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.primaryEmailAddress?.emailAddress,
        subject: `Order Confirmation #${order.id}`,
        html: emailHtml,
      });

      await this.logEmailSent('order_confirmation', order.id, user.id);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      throw error;
    }
  }

  async sendEnrollmentWelcome(enrollment, user, testPack) {
    try {
      const emailHtml = render(
        EnrollmentWelcomeEmail({
          customerName: user.fullName,
          testPackName: testPack.name,
          startDate: new Date(enrollment.enrolled_at).toLocaleDateString(),
          expiryDate: new Date(enrollment.expires_at).toLocaleDateString(),
          accessLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/user`,
        })
      );

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.primaryEmailAddress?.emailAddress,
        subject: `Welcome to ${testPack.name}!`,
        html: emailHtml,
      });

      await this.logEmailSent('enrollment_welcome', enrollment.id, user.id);
    } catch (error) {
      console.error('Failed to send enrollment welcome email:', error);
      throw error;
    }
  }

  async sendRefundConfirmation(refund, user, order) {
    try {
      const emailHtml = render(
        RefundConfirmationEmail({
          customerName: user.fullName,
          orderNumber: order.id,
          refundAmount: refund.amount,
          refundDate: new Date(refund.created_at).toLocaleDateString(),
          reason: refund.reason,
        })
      );

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.primaryEmailAddress?.emailAddress,
        subject: `Refund Confirmation for Order #${order.id}`,
        html: emailHtml,
      });

      await this.logEmailSent('refund_confirmation', refund.id, user.id);
    } catch (error) {
      console.error('Failed to send refund confirmation email:', error);
      throw error;
    }
  }

  async logEmailSent(type, referenceId, userId) {
    try {
      await db.execute(
        `INSERT INTO email_logs (
          id,
          type,
          reference_id,
          user_id,
          sent_at
        ) VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), type, referenceId, userId, new Date()]
      );
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }
}

// Create and export a single instance
const emailService = new EmailService();
export default emailService;
