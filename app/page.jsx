"use client";

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">PanaSystem</p>
        <Button
          variant="ghost"
          color="primary"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Dashboard
        </Button>
      </div>

    </div>
  );
}