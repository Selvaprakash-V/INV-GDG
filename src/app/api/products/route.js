import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';

// GET all products for a store
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
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const expiryDays = searchParams.get('expiryDays');
    const search = searchParams.get('search');

    // Build query
    let query = {};
    
    // If storeId is provided, filter by store
    if (storeId) {
      query.storeId = storeId;
    } else if (session.user.role === 'Administrator') {
      // If admin, show only their products
      query.storeId = session.user.id;
    } else {
      // For customers, we might want to show products from all stores or specific stores
      // This depends on your business logic
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by expiry days if provided
    if (expiryDays) {
      const daysFromNow = new Date();
      daysFromNow.setDate(daysFromNow.getDate() + parseInt(expiryDays));
      query.expiryDate = { $lte: daysFromNow };
    }

    // Search by name or description if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show active products
    query.isActive = true;

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, products },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new product
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only administrators can add products
    if (session.user.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can add products' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    const body = await request.json();
    const { 
      name, description, category, price, stock, 
      expiryDate, barcode, image 
    } = body;

    // Validate required fields
    if (!name || !category || !price || !stock || !expiryDate || !barcode) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if product with barcode already exists
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product with this barcode already exists' },
        { status: 409 }
      );
    }

    // Create new product
    const product = new Product({
      name,
      description,
      category,
      price,
      stock,
      expiryDate,
      barcode,
      image: image || '/images/default-product.png',
      storeId: session.user.id,
    });

    await product.save();

    return NextResponse.json(
      { success: true, message: 'Product added successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
