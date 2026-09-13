import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Kita dah tukar apiVersion ke versi 2026 yang betul! 👇
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-08-26.dahlia' as any, 
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const origin = req.headers.get('origin') || 'https://ashgalleri.com';

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'myr', // Wajib MYR untuk FPX
        product_data: {
          name: item.product.name,
          images: item.product.image_url ? [item.product.image_url] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      // MAGIS FPX & KAD: Tambah 'fpx' di sini! 
      payment_method_types: ['card', 'fpx'], 
      line_items: lineItems,
      mode: 'payment',
      // HALA TUJU SELEPAS BAYARAN: Pergi ke muka surat Success baru!
      success_url: `${origin}/success`, 
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Ralat Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}