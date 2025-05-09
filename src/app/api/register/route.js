import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { connectToDatabase, connectToLocalDatabase } from '@/lib/mongodb-direct';
import User from '@/models/User';

export async function POST(request) {
  try {
    console.log('Register API called');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    const { fullName, email, password, confirmPassword, role, shopName } = body;

    // Validate input
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
        },
        { status: 400 }
      );
    }

    // If role is Administrator, shopName is required
    if (role === 'Administrator' && !shopName) {
      return NextResponse.json(
        { success: false, message: 'Shop name is required for administrators' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Attempting to connect to MongoDB...');
    try {
      // Try the main connection method first
      try {
        await dbConnect();
        console.log('MongoDB connection successful using dbConnect');
      } catch (mainError) {
        console.log('Primary connection method failed, trying direct connection...');
        try {
          await connectToDatabase();
          console.log('MongoDB connection successful using direct connection');
        } catch (directError) {
          console.log('Direct connection failed, trying local connection...');
          try {
            await connectToLocalDatabase();
            console.log('MongoDB connection successful using local connection');
          } catch (localError) {
            throw new Error('All connection methods failed');
          }
        }
      }
    } catch (dbError) {
      console.error('All MongoDB connection methods failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database connection error', error: dbError.message },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user
    console.log('Creating new user...');
    try {
      const user = new User({
        fullName,
        email,
        password, // Will be hashed in the pre-save hook
        role,
        ...(role === 'Administrator' && { shopName }),
      });

      console.log('User model created, attempting to save...');
      await user.save();
      console.log('User saved successfully');

      return NextResponse.json(
        {
          success: true,
          message: 'User registered successfully',
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            ...(user.shopName && { shopName: user.shopName }),
          }
        },
        { status: 201 }
      );
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return NextResponse.json(
        { success: false, message: 'Error saving user', error: saveError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
