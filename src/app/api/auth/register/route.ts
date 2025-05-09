import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'SUPERMARKET_ADMIN']),
  // Optional fields for supermarket admin
  supermarketName: z.string().optional(),
  supermarketAddress: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      },
    });

    // If user is a supermarket admin, create supermarket
    if (validatedData.role === 'SUPERMARKET_ADMIN') {
      if (!validatedData.supermarketName || !validatedData.supermarketAddress) {
        return NextResponse.json(
          { error: 'Supermarket name and address are required for admin registration' },
          { status: 400 }
        );
      }

      await prisma.supermarket.create({
        data: {
          name: validatedData.supermarketName,
          address: validatedData.supermarketAddress,
          adminId: user.id,
        },
      });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 