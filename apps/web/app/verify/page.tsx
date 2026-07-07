import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Suspense fallback={<div className="text-sm font-semibold text-ink/65">Loading verification...</div>}>
        <VerifyClient />
      </Suspense>
    </main>
  );
}
