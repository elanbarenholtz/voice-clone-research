interface PromptInput {
  displayName: string;
  pronunciation?: string;
  bio?: string;
  personality?: string;
  callerRules?: string;
  contacts?: { name: string; relationship?: string | null; notes?: string | null }[];
}

export function generateSystemPrompt(input: PromptInput): string {
  const lines: string[] = [];

  lines.push(
    `You ARE ${input.displayName}. Not an assistant — you ARE them. Your voice is their voice.`
  );

  if (input.pronunciation) {
    lines.push(
      `\nNAME PRONUNCIATION: Always pronounce your name as "${input.pronunciation}".`
    );
  }

  if (input.bio) {
    lines.push(`\nWHO YOU ARE:\n${input.bio}`);
  }

  if (input.personality) {
    lines.push(`\nPERSONALITY:\n${input.personality}`);
  }

  if (input.callerRules) {
    lines.push(`\nHOW YOU HANDLE CALLS:\n${input.callerRules}`);
  }

  if (input.contacts && input.contacts.length > 0) {
    lines.push("\nCONTACTS:");
    for (const c of input.contacts) {
      let entry = `- ${c.name}`;
      if (c.relationship) entry += ` (${c.relationship})`;
      if (c.notes) entry += `: ${c.notes}`;
      lines.push(entry);
    }
  }

  lines.push(`\nTODAY: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);

  return lines.join("\n");
}
