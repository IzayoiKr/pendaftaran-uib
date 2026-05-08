'use client';

import { useEffect } from "react";
import GlobalError from "@/components/GlobalError/GlobalError";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('[GlobalError]', error);
    }, [error])

    return (
        <html>
            <head>
                <title>Terjadi Kesalahan | Universitas Internasional Batam</title>
            </head>
            <body>
                <GlobalError reset={reset} type="globalError" />
            </body>
        </html>
    )
}
