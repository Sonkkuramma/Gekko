import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function EnrollmentSummary({ enrollmentData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Successful!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">User Information</h3>
            <p>Name: {enrollmentData.userInfo.name}</p>
            <p>Email: {enrollmentData.userInfo.email}</p>
            <p>Phone: {enrollmentData.userInfo.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold">Test Pack Details</h3>
            <p>Title: {enrollmentData.testPackDetails.title}</p>
            <p>ID: {enrollmentData.testPackDetails.id}</p>
          </div>
          <div>
            <h3 className="font-semibold">Payment Information</h3>
            <p>
              Card ending in: {enrollmentData.paymentInfo.cardNumber.slice(-4)}
            </p>
          </div>
        </div>
        <div className="mt-6 space-x-4">
          <Button>Download Receipt</Button>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
