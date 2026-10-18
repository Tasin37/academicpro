import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Order } from "@/src/models/models";
import { OrderStatus } from "@/src/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    await mongooseConnect();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Admin orders fetch error:", err);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    const body = (await request.json()) as { orderId?: string; status?: OrderStatus };
    if (!body.orderId || !body.status) {
      return NextResponse.json({ error: "Order ID and status are required." }, { status: 400 });
    }

    if (!Object.values(OrderStatus).includes(body.status)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    await mongooseConnect();
    const order = await Order.findById(body.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    order.status = body.status;
    if (body.status === OrderStatus.COMPLETED) {
      order.completedAt = new Date();
    } else if (body.status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
    }

    await order.save();

    return NextResponse.json({ message: "Order status updated successfully.", order });
  } catch (err) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Order ID parameter is required." }, { status: 400 });
    }

    await mongooseConnect();
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({ message: "Order removed successfully." });
  } catch (err) {
    console.error("Admin order deletion error:", err);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}

