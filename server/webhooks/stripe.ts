import { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Webhook handler for Stripe events
 * This endpoint receives notifications from Stripe about payment events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle checkout.session.completed event
 * This is fired when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Processing checkout session: ${session.id}`);

  // Extract metadata
  const userId = parseInt(session.metadata?.userId || "0");
  const courseId = parseInt(session.metadata?.courseId || "0");

  if (!userId || !courseId) {
    console.error("[Stripe Webhook] Missing userId or courseId in metadata");
    return;
  }

  // Check if enrollment already exists
  const existingEnrollment = await db.getEnrollmentByCheckoutSession(session.id);
  if (existingEnrollment) {
    console.log(`[Stripe Webhook] Enrollment already exists for session ${session.id}`);
    return;
  }

  // Only create enrollment if payment was successful
  if (session.payment_status === "paid") {
    // Create enrollment
    const enrollment = await db.createEnrollment({
      userId,
      courseId,
      stripeCustomerId: session.customer as string,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCheckoutSessionId: session.id,
      status: "active",
    });

    console.log(`[Stripe Webhook] Created enrollment ${enrollment.id} for user ${userId}`);

    // Create payment record
    await db.createPayment({
      enrollmentId: enrollment.id,
      userId,
      stripePaymentIntentId: session.payment_intent as string,
      amount: ((session.amount_total || 0) / 100).toString(),
      currency: session.currency || "brl",
      status: "succeeded",
      paymentMethod: session.payment_method_types?.[0] || "card",
    });

    console.log(`[Stripe Webhook] Created payment record for enrollment ${enrollment.id}`);
  } else {
    console.log(`[Stripe Webhook] Payment not completed yet, status: ${session.payment_status}`);
  }
}

/**
 * Handle payment_intent.succeeded event
 * This is fired when a payment is successfully processed
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);

  // Update payment status
  await db.updatePaymentStatus(paymentIntent.id, "succeeded");
}

/**
 * Handle payment_intent.payment_failed event
 * This is fired when a payment fails
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);

  // Update payment status
  await db.updatePaymentStatus(paymentIntent.id, "failed");
}

/**
 * Handle charge.refunded event
 * This is fired when a charge is refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`[Stripe Webhook] Charge refunded: ${charge.id}`);

  // Update payment status
  if (charge.payment_intent) {
    await db.updatePaymentStatus(charge.payment_intent as string, "refunded");
  }
}
