"use client";

import SpotifyAuthButton from "./_components/SpotifyAuthButton";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between m-24">
      <h1>Display your Spotify Profile Data</h1>
      <SpotifyAuthButton />
    </main>
  );
}
