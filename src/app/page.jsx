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
      <Link href="/explore/seller">Explore Seller</Link>
      <Link href="/explore/customer">Explore Customer</Link>
      <Link href="/login">Login</Link>
      <Link href="/contact">Contact</Link>
      <link href="administrator/dashboard">Admin Dashboard</link>
      <link href="customer/dashboard">Customer Dashboard</link> 
      <Link href="/administrator/signup">Admin Sign Up</Link>
      <Link href="/customer/signup">Customer Sign Up</Link>

    </div>
  );
}