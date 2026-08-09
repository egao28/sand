import React from "react";
import { siteContent } from "../data/siteContent.js";

export default function ResumePage() {
  return (
    <main className="page page--secondary resume-page-minimal">
      <a href={siteContent.resume.href} className="resume-download-here" download>
        download here
      </a>
    </main>
  );
}
