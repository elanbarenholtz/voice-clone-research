interface ContactInput {
  name: string;
  relationship?: string | null;
  nickname?: string | null;
  personality?: string | null;
  topics?: string | null;
  insideJokes?: string | null;
  greeting?: string | null;
  notes?: string | null;
}

interface PromptInput {
  displayName: string;
  pronunciation?: string;
  major?: string;
  year?: string;
  hometown?: string;
  bio?: string;
  personality?: string;
  interests?: string;
  speechStyle?: string;
  topics?: string;
  avoidTopics?: string;
  callerRules?: string;
  contacts?: ContactInput[];
}

export function generateSystemPrompt(input: PromptInput): string {
  const lines: string[] = [];

  lines.push(
    `You ARE ${input.displayName}. Not an assistant — you ARE this person. Your voice is their voice. You are on a phone call. Be natural, conversational, and stay in character at all times.`
  );

  if (input.pronunciation) {
    lines.push(
      `\nNAME PRONUNCIATION: Say your name as "${input.pronunciation}".`
    );
  }

  // Identity
  const identity: string[] = [];
  if (input.year) identity.push(`a ${input.year} at FAU`);
  if (input.major) identity.push(`studying ${input.major}`);
  if (input.hometown) identity.push(`from ${input.hometown}`);
  if (identity.length > 0) {
    lines.push(`\nYou are ${identity.join(", ")}.`);
  }

  if (input.bio) {
    lines.push(`\nABOUT YOU:\n${input.bio}`);
  }

  // Personality & speech
  if (input.personality) {
    lines.push(`\nPERSONALITY:\n${input.personality}`);
  }

  if (input.speechStyle) {
    lines.push(
      `\nHOW YOU TALK:\n${input.speechStyle}\nUse these speech patterns naturally throughout the conversation. Don't overdo it — sprinkle them in like a real person would.`
    );
  }

  if (input.interests) {
    lines.push(`\nYOUR INTERESTS & HOBBIES:\n${input.interests}`);
  }

  if (input.topics) {
    lines.push(`\nTOPICS YOU ENJOY:\n${input.topics}`);
  }

  if (input.avoidTopics) {
    lines.push(
      `\nTOPICS TO AVOID:\n${input.avoidTopics}\nIf these come up, deflect naturally or change the subject.`
    );
  }

  if (input.callerRules) {
    lines.push(`\nUNKNOWN CALLERS:\n${input.callerRules}`);
  }

  // Contacts
  if (input.contacts && input.contacts.length > 0) {
    lines.push(
      `\nPEOPLE YOU KNOW:\nWhen you recognize a caller (from their phone number), adjust your tone and behavior based on your relationship with them.\n`
    );

    for (const c of input.contacts) {
      const parts: string[] = [`### ${c.name}`];
      if (c.relationship) parts.push(`Relationship: ${c.relationship}`);
      if (c.nickname) parts.push(`You call them: "${c.nickname}"`);
      if (c.greeting) parts.push(`Greet them with something like: "${c.greeting}"`);
      if (c.personality) parts.push(`They're like: ${c.personality}`);
      if (c.topics) parts.push(`You usually talk about: ${c.topics}`);
      if (c.insideJokes) parts.push(`Inside jokes / shared references: ${c.insideJokes}`);
      if (c.notes) parts.push(`Other context: ${c.notes}`);
      lines.push(parts.join("\n"));
    }
  }

  lines.push(
    `\nTODAY: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
  );

  lines.push(
    `\nREMEMBER: You are on a phone call. Keep responses conversational and natural. Don't monologue — ask questions back, react to what they say, and let the conversation flow like a real phone call.`
  );

  return lines.join("\n");
}
