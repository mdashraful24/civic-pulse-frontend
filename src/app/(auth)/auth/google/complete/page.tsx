import { Suspense } from "react";
import { GoogleComplete } from "./google-complete";

export default function GoogleCompletePage() {
  return (
    <Suspense fallback={null}>
      <GoogleComplete />
    </Suspense>
  );
}
