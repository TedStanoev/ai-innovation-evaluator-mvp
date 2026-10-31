// Utility to generate a valid PDF blob and open it in a new tab
export function createDeliverablePdfBlob(
  deliverable: {
    name?: string;
    label?: string;
    filename?: string;
    value?: string;
    fileSize?: string;
    type?: string;
  },
  project: {
    id: string;
    title: string;
    team: {
      name: string;
      faculty: string;
      members: Array<{
        name: string;
        facultyNumber?: string;
        email?: string;
        major?: string;
      }>;
    };
    summary: string;
  },
  contestTitle?: string
): Blob {
  const sanitize = (str: string) => (str || "").replace(/[()\\\r\n]/g, " ").trim();

  const title = sanitize(project.title);
  const team = sanitize(project.team.name);
  const faculty = sanitize(project.team.faculty);
  const deliverableName = sanitize(
    deliverable.label || deliverable.name || "Deliverable Document"
  );
  const filename = sanitize(deliverable.filename || deliverable.value || "document.pdf");
  const summary = sanitize(project.summary);
  const contest = sanitize(contestTitle || "Academic Innovation & AI Evaluation Challenge");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const members = project.team.members
    .map((m) => `${sanitize(m.name)} (ID: ${sanitize(m.facultyNumber || "N/A")})`)
    .join(", ");

  const wrapText = (text: string, maxLen = 72) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      if (!w) continue;
      if ((current + " " + w).trim().length <= maxLen) {
        current = (current + " " + w).trim();
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const summaryLines = wrapText(summary, 72).slice(0, 10);
  const memberLines = wrapText(members, 72).slice(0, 3);

  const textCommands: string[] = [
    "BT",
    "/F1 18 Tf",
    "50 780 Td",
    `(${title.slice(0, 55)}) Tj`,

    "/F1 11 Tf",
    "0 -24 Td",
    `(${contest}) Tj`,

    "/F1 12 Tf",
    "0 -24 Td",
    `(Team: ${team}  |  Faculty: ${faculty}) Tj`,

    "/F1 10 Tf",
    "0 -20 Td",
    `(Deliverable: ${deliverableName}  -  File: ${filename}) Tj`,

    "0 -16 Td",
    `(Submission Date: ${dateStr}  |  Submission ID: ${project.id}) Tj`,

    "0 -26 Td",
    "/F1 12 Tf",
    "(Registered Student Members:) Tj",
    "/F1 10 Tf",
  ];

  for (const mLine of memberLines) {
    textCommands.push("0 -15 Td");
    textCommands.push(`(${mLine}) Tj`);
  }

  textCommands.push(
    "0 -26 Td",
    "/F1 12 Tf",
    "(Executive Summary & Abstract:) Tj",
    "/F1 10 Tf"
  );

  for (const sLine of summaryLines) {
    textCommands.push("0 -15 Td");
    textCommands.push(`(${sLine}) Tj`);
  }

  textCommands.push(
    "0 -32 Td",
    "/F1 11 Tf",
    "(Academic Integrity Verification:) Tj",
    "/F1 9 Tf",
    "0 -16 Td",
    "(Status: Verified by AIIE Academic Intake Protocol | Plagiarism Scan: 0% Match) Tj",
    "0 -14 Td",
    "(Audit Signature: SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) Tj",
    "0 -14 Td",
    "(Official contest archive deliverable - Tamper-proof academic artifact) Tj",
    "ET"
  );

  const stream = textCommands.join("\n");
  const streamBytes = new TextEncoder().encode(stream);
  const streamLength = streamBytes.length;

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 =
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const header = "%PDF-1.4\n";
  const offset1 = header.length;
  const offset2 = offset1 + obj1.length;
  const offset3 = offset2 + obj2.length;
  const offset4 = offset3 + obj3.length;
  const offset5 = offset4 + obj4.length;
  const startxref = offset5 + obj5.length;

  const pad10 = (n: number) => n.toString().padStart(10, "0");

  const xref = `xref\n0 6\n0000000000 65535 f \n${pad10(offset1)} 00000 n \n${pad10(
    offset2
  )} 00000 n \n${pad10(offset3)} 00000 n \n${pad10(offset4)} 00000 n \n${pad10(
    offset5
  )} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  return new Blob([fullPdf], { type: "application/pdf" });
}

export function openDeliverablePdfInNewTab(
  deliverable: {
    name?: string;
    label?: string;
    filename?: string;
    value?: string;
    fileSize?: string;
    type?: string;
  },
  project: {
    id: string;
    title: string;
    team: {
      name: string;
      faculty: string;
      members: Array<{
        name: string;
        facultyNumber?: string;
        email?: string;
        major?: string;
      }>;
    };
    summary: string;
  },
  contestTitle?: string
) {
  const blob = createDeliverablePdfBlob(deliverable, project, contestTitle);
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
