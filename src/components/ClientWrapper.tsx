"use client";

import { Toaster } from "react-hot-toast";

export default function ClientWrapper() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
