import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/models/News';
import { Category } from '@/models/Category';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [totalNews, publishedNews, draftNews, totalCategories] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ status: 'draft' }),
      Category.countDocuments(),
    ]);

    const recentNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title category categoryLabel status pubDate views createdAt');

    // Aggregate news per category
    const categoryStats = await News.aggregate([
      { $group: { _id: '$categoryLabel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalNews,
        publishedNews,
        draftNews,
        totalCategories,
      },
      recentNews,
      categoryStats,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
