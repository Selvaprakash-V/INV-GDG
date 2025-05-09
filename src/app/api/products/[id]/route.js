import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET a single product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) a product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only administrators can update products
    if (session.user.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can update products' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user owns this product
    if (product.storeId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You can only update your own products' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, message: 'Product updated successfully', product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only administrators can delete products
    if (session.user.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only administrators can delete products' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user owns this product
    if (product.storeId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You can only delete your own products' },
        { status: 403 }
      );
    }

    // Instead of hard delete, we'll soft delete by setting isActive to false
    await Product.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
