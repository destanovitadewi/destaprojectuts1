import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, rating, message } = body;

  try {
    await addDoc(collection(db, 'feedbacks'), {
      name,
      rating: Number(rating), // pastikan rating disimpan sebagai angka
      message,
      timestamp: new Date(),
    });
    return NextResponse.json({ message: 'Komentar berhasil disimpan' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan komentar: ' + error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbackSnapshot = await getDocs(collection(db, 'feedbacks'));
    const feedbacks = feedbackSnapshot.docs.map(doc => doc.data());

    const ratings = feedbacks
      .map(fb => Number(fb.rating))
      .filter(r => !isNaN(r));

    const averageRating = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0;

    return NextResponse.json(
      {
        feedbacks,
        averageRating,
        total: feedbacks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data komentar: ' + error }, { status: 500 });
  }
}
