"use client";

import GlobalError from "@/components/GlobalError/GlobalError";

interface ErrorProps {
    reset: () => void;
}

export default function ErrorPage({ reset }: ErrorProps) {
    return <GlobalError reset={reset} type="error" />;
}
