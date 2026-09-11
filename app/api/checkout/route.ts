import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Mengaktifkan enjin Stripe menggunakan Kunci Rahsia awak berserta versi "dahlia" 🌺
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia', 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Troli kosong' }, { status: 400 });
    }

    // Tukar format barang dari troli awak ke format yang Stripe faham
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'myr',
        product_data: {
          name: item.product.name,
          images: [item.product.image_url || 'https://via.placeholder.com/150'],
        },
        unit_amount: Math.round(item.product.price * 100), // Stripe kira dalam sen, jadi darab 100
      },
      quantity: item.quantity,
    }));

    // Buka sesi resit pembayaran di Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/?success=true`, // Kalau berjaya bayar, balik ke muka depan
      cancel_url: `${request.headers.get('origin')}/profile?canceled=true`, // Kalau batal, balik ke troli
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}