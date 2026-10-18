import { NextResponse } from "next/server";
import { read, driver } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Read-only liveness probe. `orders` and `savedAt` together make a silent
 * re-seed visible: if the store were being overwritten, the order count would
 * snap back to the seeded figure and savedAt would reset.
 */
export async function GET() {
  try {
    const db = await read();
    return NextResponse.json({
      ok: true,
      driver: driver.name,
      durable: driver.durable,
      seedVersion: db.version,
      savedAt: db.savedAt ?? null,
      counts: {
        products: db.products.length,
        variants: db.variants.length,
        orders: db.orders.length,
        customers: db.customers.length,
      },
      latestOrder: db.orders.at(-1)?.code ?? null,
      now: new Date().toISOString(),
    });
  } catch (error) {
    // A failed read must read as a failure, not as an empty shop.
    return NextResponse.json(
      { ok: false, driver: driver.name, error: (error as Error).message },
      { status: 503 },
    );
  }
}
