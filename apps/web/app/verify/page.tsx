import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export default function VerifyPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Suspense fallback={<div className="h-10 w-10 animate-spin rounded-full border border-ink/10 border-t-ink/55" />}>
        <VerifyClient />
      </Suspense>
    </main>
  );
}
