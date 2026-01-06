import MessagesPage from "@/components/pages/messages-page";
import React from "react";

export default function Messanger() {
  return (
    <>
      <div className="py-3 px-8 flex flex-row justify-between">
        <MessagesPage />
      </div>
    </>
  );
}
