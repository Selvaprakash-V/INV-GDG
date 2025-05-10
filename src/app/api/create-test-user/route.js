import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('Creating test users...');
    await dbConnect();

    // Check if test users already exist
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    const customerExists = await User.findOne({ email: 'customer@test.com' });

    if (adminExists && customerExists) {
      return NextResponse.json({
        success: true,
        message: 'Test users already exist',
        adminCredentials: { email: 'admin@test.com', password: 'Admin123' },
        customerCredentials: { email: 'customer@test.com', password: 'Customer123' }
      });
    }

    // Create test admin if doesn't exist
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123', salt);

      const admin = new User({
        fullName: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'Administrator',
        shopName: 'Test Store',
      });

      await admin.save();
      console.log('Test admin created');
    }

    // Create test customer if doesn't exist
    if (!customerExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Customer123', salt);

      const customer = new User({
        fullName: 'Test Customer',
        email: 'customer@test.com',
        password: hashedPassword,
        role: 'Customer',
      });

      await customer.save();
      console.log('Test customer created');
    }

    return NextResponse.json({
      success: true,
      message: 'Test users created successfully',
      adminCredentials: { email: 'admin@test.com', password: 'Admin123' },
      customerCredentials: { email: 'customer@test.com', password: 'Customer123' }
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating test users', error: error.message },
      { status: 500 }
    );
  }
}
