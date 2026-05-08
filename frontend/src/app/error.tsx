'use client';

import { useEffect } from "react";
import GlobalError from "@/components/GlobalError/GlobalError";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[GlobalError]', error);
    }, [error])

    return <GlobalError reset={reset} type="error" />;
}
