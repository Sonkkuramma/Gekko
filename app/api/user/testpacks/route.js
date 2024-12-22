// app/api/user/testpacks/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import CircuitBreaker from '@/lib/circuitBreaker';

const circuitBreaker = new CircuitBreaker();

export async function GET() {
  return circuitBreaker.call(async () => {
    try {
      const { userId } = auth();

      if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const pool = await getConnection();
      const [rows] = await pool.query(
        `
        SELECT 
          tp.pack_id,
          tp.exam_id,
          tp.pack_type,
          tp.pack_name,
          tp.pack_short_description,
          tp.pack_slug,
          tp.is_premium,
          tp.pack_image_url,
          tp.pack_banner_url,
          GROUP_CONCAT(DISTINCT t.tag_name) as tags,
          ue.enrolled_at,
          ue.is_premium as enrollment_is_premium,
          ue.status as enrollment_status,
          ue.bundle_id,
          b.bundle_name
        FROM test_packs tp
        INNER JOIN user_enrollments ue ON tp.pack_id = ue.test_pack_id
        LEFT JOIN test_pack_tag_association tpta ON tp.pack_id = tpta.test_pack_id
        LEFT JOIN tags t ON tpta.tag_id = t.tag_id
        LEFT JOIN bundles b ON ue.bundle_id = b.bundle_id
        WHERE ue.user_id = ?
          AND ue.status = 'active'
        GROUP BY 
          tp.pack_id, tp.exam_id, tp.pack_type, tp.pack_name, 
          tp.pack_short_description, tp.pack_slug, tp.is_premium, 
          tp.pack_image_url, tp.pack_banner_url,
          ue.enrolled_at, ue.is_premium, ue.status,
          ue.bundle_id, b.bundle_name
        ORDER BY ue.enrolled_at DESC
        `,
        [userId]
      );

      const testPacks = rows.map((row) => ({
        id: row.pack_id,
        examId: row.exam_id,
        type: row.pack_type,
        title: row.pack_name,
        subtitle: row.pack_short_description,
        test_pack_slug: row.pack_slug,
        is_premium: Boolean(row.is_premium),
        enrollment_is_premium: Boolean(row.enrollment_is_premium),
        enrollment_status: row.enrollment_status,
        enrolled_at: row.enrolled_at,
        imageUrl: row.pack_image_url || null,
        bannerUrl: row.pack_banner_url || null,
        tags: row.tags ? row.tags.split(',') : [],
        bundle_id: row.bundle_id || null,
        bundle_name: row.bundle_name || null,
      }));

      return NextResponse.json({ testPacks });
    } catch (error) {
      console.error('Error fetching user test packs:', error);
      return NextResponse.json(
        {
          message: 'Internal Server Error',
          error: error.message,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            sql: error.sql,
            sqlMessage: error.sqlMessage,
          }),
        },
        { status: 500 }
      );
    }
  });
}
