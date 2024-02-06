import Link from "next/link";
import React from "react";

export default function SpotifyAuthButton() {
  return (
    <div className=" m-3.5">
      <Link
        href={"/spotify/login"}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded "
      >
        Login
      </Link>
    </div>
  );
}
