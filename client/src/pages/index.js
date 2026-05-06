import NewLandingPage from "@/components/NewLandingPage";
import Head from "next/head";

export default function Home() {
    return (
        <>
            <Head>
                <title>EventX - Event Management System</title>
                <meta name="description" content="Book and explore upcoming events with EventX" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NewLandingPage />
        </>
    );
}
