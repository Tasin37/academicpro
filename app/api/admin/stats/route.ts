import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Order, User } from "@/src/models/models";
import { UserRole } from "@/src/models/User";
import { OrderStatus } from "@/src/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    await mongooseConnect();

    const [
      totalUsers,
      totalStudents,
      totalWriters,
      totalAdmins,
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      orderBudgets,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: UserRole.STUDENT }),
      User.countDocuments({ role: UserRole.WRITER }),
      User.countDocuments({ role: UserRole.ADMIN }),
      Order.countDocuments(),
      Order.countDocuments({ status: OrderStatus.PENDING }),
      Order.countDocuments({ status: OrderStatus.IN_PROGRESS }),
      Order.countDocuments({ status: { $in: [OrderStatus.COMPLETED, OrderStatus.SUBMITTED] } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$budget" } } }]),
    ]);

    const totalVolume = orderBudgets.length > 0 ? orderBudgets[0].total : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalWriters,
        totalAdmins,
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        totalVolume,
      },
    });
  } catch (err) {
    console.error("Admin stats fetch error:", err);
    return NextResponse.json({ error: "Failed to load admin stats." }, { status: 500 });
  }
}
