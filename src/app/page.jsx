// app/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link';

export default function Home() {
  redirect('/home');
  
  // This return statement won't actually execute because of the redirect above,
  // but it needs to be valid JSX if you remove the redirect
  return (
    <div>
      <Link href="/about">About</Link>
      <Link href="/role">Role</Link>
      <Link href="/home">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/exploreseller">Explore Seller</Link>
      <Link href="/explorecustomer">Explore Customer</Link>
      <Link href="/administratorsignup">Admin Sign Up</Link>
      <Link href="/customersignup">Customer Sign Up</Link>
      <Link href="/login">Login</Link>
      <Link href="/contact">Contact</Link>
      <Link href="admmindashboard">Admin Dashboard</Link>
      <Link href="customerdashboard">Customer Dashboard</Link>

    </div>
  );
}