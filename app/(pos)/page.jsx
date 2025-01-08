"use client";

import { useRouter } from "next/navigation";
import POSNavbar from "./components/Navbar";
import SaleData from "./components/SaleData";

export default function POSPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      <POSNavbar />

      <SaleData />
    </div>
  );
}