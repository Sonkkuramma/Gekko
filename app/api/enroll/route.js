// app/api/enroll/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { bundleId, testPackId, isPremium, amountPaid = 0 } = body;

    // Convert IDs to strings if they're provided
    testPackId = testPackId ? String(testPackId).trim() : null;
    bundleId = bundleId ? String(bundleId).trim() : null;

    if (!bundleId && !testPackId) {
      return NextResponse.json(
        { error: 'Either bundleId or testPackId must be provided' },
        { status: 400 }
      );
    }

    const isPremiumValue = Boolean(isPremium) ? 1 : 0;
    const amountPaidValue = Number(amountPaid) || 0;

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      if (bundleId) {
        // Verify bundle exists
        const [bundles] = await connection.execute(
          'SELECT bundle_id FROM bundles WHERE bundle_id = ?',
          [bundleId]
        );

        if (bundles.length === 0) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { error: `Bundle with ID ${bundleId} not found` },
            { status: 404 }
          );
        }

        // Record initial bundle enrollment in history
        // Note: test_pack_id is NULL for the bundle-level enrollment
        await connection.execute(
          `INSERT INTO enrollment_history 
           (user_id, bundle_id, test_pack_id, is_premium, amount_paid) 
           VALUES (?, ?, NULL, ?, ?)`,
          [userId, bundleId, isPremiumValue, amountPaidValue]
        );

        // Get all test packs in the bundle
        const [testPacks] = await connection.execute(
          'SELECT pack_id FROM bundle_packs WHERE bundle_id = ?',
          [bundleId]
        );

        // Enroll in each test pack
        for (const { pack_id } of testPacks) {
          // Create enrollment for each test pack
          await connection.execute(
            `INSERT INTO user_enrollments 
             (user_id, test_pack_id, bundle_id, is_premium, status) 
             VALUES (?, ?, ?, ?, 'active')
             ON DUPLICATE KEY UPDATE 
             is_premium = ?, 
             bundle_id = ?,
             status = 'active'`,
            [
              userId,
              pack_id,
              bundleId,
              isPremiumValue,
              isPremiumValue,
              bundleId,
            ]
          );

          // Record test pack enrollment in history
          await connection.execute(
            `INSERT INTO enrollment_history 
             (user_id, test_pack_id, bundle_id, is_premium, amount_paid) 
             VALUES (?, ?, ?, ?, 0)`,
            [userId, pack_id, bundleId, isPremiumValue]
          );
        }
      } else if (testPackId) {
        // Single test pack enrollment
        // Verify test pack exists
        const [testPacks] = await connection.execute(
          'SELECT pack_id FROM test_packs WHERE pack_id = ?',
          [testPackId]
        );

        if (testPacks.length === 0) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { error: `Test pack with ID ${testPackId} not found` },
            { status: 404 }
          );
        }

        // Create enrollment
        await connection.execute(
          `INSERT INTO user_enrollments 
           (user_id, test_pack_id, is_premium, status) 
           VALUES (?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE is_premium = ?, status = 'active'`,
          [userId, testPackId, isPremiumValue, isPremiumValue]
        );

        // Record in history
        await connection.execute(
          `INSERT INTO enrollment_history 
           (user_id, test_pack_id, is_premium, amount_paid) 
           VALUES (?, ?, ?, ?)`,
          [userId, testPackId, isPremiumValue, amountPaidValue]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: bundleId
          ? 'Bundle enrollment successful'
          : 'Test pack enrollment successful',
        data: { userId, bundleId, testPackId },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Enrollment failed', details: error.message },
      { status: 500 }
    );
  }
}
