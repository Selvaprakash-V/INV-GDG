import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';
import { v4 as uuidv4 } from 'uuid';

// GET purchases for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const storeId = searchParams.get('storeId');

    // Build query
    let query = {};
    
    // Filter by user role
    if (session.user.role === 'Customer') {
      query.customerId = session.user.id;
    } else if (session.user.role === 'Administrator') {
      query.storeId = session.user.id;
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by store if provided (for customers)
    if (storeId && session.user.role === 'Customer') {
      query.storeId = storeId;
    }

    const purchases = await Purchase.find(query)
      .sort({ purchaseDate: -1 })
      .populate('customerId', 'fullName email')
      .populate('storeId', 'shopName');

    return NextResponse.json(
      { success: true, purchases },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new purchase
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only administrators can add purchases
    if (session.user.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can add purchases' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    const body = await request.json();
    const { customerId, items, totalAmount, paymentMethod } = body;

    // Validate required fields
    if (!customerId || !items || !totalAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process items and update product stock
    const processedItems = [];
    for (const item of items) {
      const { productId, quantity } = item;
      
      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${productId} not found` },
          { status: 404 }
        );
      }

      // Check if product belongs to this store
      if (product.storeId.toString() !== session.user.id) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${productId} does not belong to your store` },
          { status: 403 }
        );
      }

      // Check if enough stock
      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, message: `Not enough stock for product: ${product.name}` },
          { status: 400 }
        );
      }

      // Update product stock
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
        updatedAt: Date.now()
      });

      // Add to processed items
      processedItems.push({
        productId,
        productName: product.name,
        quantity,
        price: product.price,
        expiryDate: product.expiryDate
      });
    }

    // Generate receipt number
    const receiptNumber = `REC-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Create purchase
    const purchase = new Purchase({
      customerId,
      storeId: session.user.id,
      items: processedItems,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      receiptNumber
    });

    await purchase.save();

    return NextResponse.json(
      { success: true, message: 'Purchase recorded successfully', purchase },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording purchase:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
