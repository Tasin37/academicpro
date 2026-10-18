import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Order, Writer } from "@/src/models/models";
import { OrderStatus } from "@/src/models/Order";

async function getAuthenticatedWriter() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "writer") {
    return null;
  }

  await mongooseConnect();
  let writer = await Writer.findOne({ userId: session.user.id });
  if (!writer) {
    writer = await Writer.create({
      userId: session.user.id,
      hourlyRate: 20,
      expertise: ["General Academic Writing"],
      isVerified: true,
    });
  }
  return { session, writer };
}

export async function GET() {
  try {
    const auth = await getAuthenticatedWriter();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Writer access only." }, { status: 401 });
    }

    const { writer } = auth;

    const [availableOrders, myOrders] = await Promise.all([
      Order.find({
        status: OrderStatus.PENDING,
        $or: [{ writerId: { $exists: false } }, { writerId: null }],
      })
        .sort({ createdAt: -1 })
        .lean(),
      Order.find({ writerId: writer._id })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const assignedCount = myOrders.filter((o) => o.status === OrderStatus.IN_PROGRESS || o.status === OrderStatus.ASSIGNED).length;
    const completedCount = myOrders.filter((o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SUBMITTED).length;
    const totalEarnings = myOrders
      .filter((o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SUBMITTED)
      .reduce((sum, o) => sum + (Number(o.budget) || 0), 0);

    return NextResponse.json({
      availableOrders,
      myOrders,
      stats: {
        availableCount: availableOrders.length,
        assignedCount,
        completedCount,
        totalEarnings,
      },
    });
  } catch (err) {
    console.error("Failed to fetch writer orders:", err);
    return NextResponse.json({ error: "Failed to load writer dashboard data." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedWriter();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Writer access only." }, { status: 401 });
    }

    const { writer } = auth;
    const body = (await request.json()) as { orderId?: string; action?: "claim" | "submit" };

    if (!body.orderId || !body.action) {
      return NextResponse.json({ error: "Order ID and action are required." }, { status: 400 });
    }

    if (body.action === "claim") {
      const order = await Order.findById(body.orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      if (order.writerId && !order.writerId.equals(writer._id)) {
        return NextResponse.json({ error: "This order is already claimed by another writer." }, { status: 409 });
      }

      order.writerId = writer._id;
      order.status = OrderStatus.IN_PROGRESS;
      await order.save();

      return NextResponse.json({ message: "Order claimed successfully!", order });
    }

    if (body.action === "submit") {
      const order = await Order.findOne({ _id: body.orderId, writerId: writer._id });
      if (!order) {
        return NextResponse.json({ error: "Order not found or not assigned to you." }, { status: 404 });
      }

      order.status = OrderStatus.SUBMITTED;
      order.completedAt = new Date();
      await order.save();

      await Writer.updateOne(
        { _id: writer._id },
        {
          $inc: {
            totalOrders: 1,
            totalEarnings: Number(order.budget) || 0,
          },
        }
      );

      return NextResponse.json({ message: "Draft submitted successfully!", order });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Failed to update order:", err);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}

