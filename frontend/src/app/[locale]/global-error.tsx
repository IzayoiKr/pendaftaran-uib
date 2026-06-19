"use client";

import GlobalError from "@/components/GlobalError/GlobalError";

interface GlobalErrorProps {
    reset: () => void;
}

export default function GlobalErrorPage({ reset }: GlobalErrorProps) {
    return (
        <html>
            <head>
                <title>
                    Terjadi Kesalahan | Universitas Internasional Batam
                </title>
            </head>
            <body>
                <GlobalError reset={reset} type="globalError" />
            </body>
        </html>
    );
}
