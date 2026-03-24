"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Contact {
  name: string;
  phone: string;
  relationship: string;
  nickname: string;
  personality: string;
  topics: string;
  insideJokes: string;
  greeting: string;
  notes: string;
}

const EMPTY_CONTACT: Contact = {
  name: "",
  phone: "",
  relationship: "",
  nickname: "",
  personality: "",
  topics: "",
  insideJokes: "",
  greeting: "",
  notes: "",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Identity
  const [displayName, setDisplayName] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");

  // Personality & style
  const [personality, setPersonality] = useState("");
  const [interests, setInterests] = useState("");
  const [speechStyle, setSpeechStyle] = useState("");
  const [topics, setTopics] = useState("");
  const [avoidTopics, setAvoidTopics] = useState("");

  // Call behavior
  const [greeting, setGreeting] = useState("Hello?");
  const [callerRules, setCallerRules] = useState("");

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [expandedContact, setExpandedContact] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/setup/load")
      .then((r) => r.json())
      .then((data) => {
        if (data.displayName) setDisplayName(data.displayName);
        if (data.pronunciation) setPronunciation(data.pronunciation);
        if (data.major) setMajor(data.major);
        if (data.year) setYear(data.year);
        if (data.hometown) setHometown(data.hometown);
        if (data.bio) setBio(data.bio);
        if (data.personality) setPersonality(data.personality);
        if (data.interests) setInterests(data.interests);
        if (data.speechStyle) setSpeechStyle(data.speechStyle);
        if (data.topics) setTopics(data.topics);
        if (data.avoidTopics) setAvoidTopics(data.avoidTopics);
        if (data.greeting) setGreeting(data.greeting);
        if (data.callerRules) setCallerRules(data.callerRules);
        if (data.contacts?.length) setContacts(data.contacts);
        setLoading(false);
      });
  }, []);

  const addContact = () => {
    const newContacts = [...contacts, { ...EMPTY_CONTACT }];
    setContacts(newContacts);
    setExpandedContact(newContacts.length - 1);
  };

  const removeContact = (i: number) => {
    setContacts(contacts.filter((_, idx) => idx !== i));
    if (expandedContact === i) setExpandedContact(null);
  };

  const updateContact = (i: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[i] = { ...updated[i], [field]: value };
    setContacts(updated);
  };

  const handleSave = async () => {
    if (!displayName) {
      setError("Display name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        pronunciation,
        major,
        year,
        hometown,
        bio,
        personality,
        interests,
        speechStyle,
        topics,
        avoidTopics,
        greeting,
        callerRules,
        contacts: contacts.filter((c) => c.name && c.phone),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Save failed");
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-gray-500 p-8">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setup Your Clone</h1>
        <p className="mt-1 text-gray-600">
          The more detail you provide, the more convincingly your clone can
          hold conversations as you. Be specific!
        </p>
      </div>

      {/* Section 1: Who are you */}
      <Section
        title="Who Are You?"
        description="Basic info so your clone knows who it is."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Marcus Johnson"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pronunciation
            </label>
            <input
              type="text"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="e.g. MAR-kus"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              How should the AI pronounce your name?
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Major / Field of Study
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Hometown
            </label>
            <input
              type="text"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              placeholder="e.g. Miami, FL"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            About You
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Write a paragraph about yourself — what would a friend say about you? What are you into? What's your vibe? The more specific, the better your clone will be."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Section>

      {/* Section 2: How you talk */}
      <Section
        title="How You Talk"
        description="Help your clone sound like you, not a generic AI."
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Personality
          </label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            placeholder='e.g. Chill and laid-back but gets excited about tech. Sarcastic humor. Pretty direct — doesn&apos;t sugarcoat things.'
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Speech Style
          </label>
          <textarea
            value={speechStyle}
            onChange={(e) => setSpeechStyle(e.target.value)}
            rows={2}
            placeholder='e.g. Uses "bro", "nah", "lowkey", "that&apos;s fire". Tends to trail off with "like..." and "you know?". Laughs a lot.'
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Slang, filler words, catchphrases, texting style — anything that makes you sound like you
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interests & Hobbies
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows={2}
            placeholder="e.g. Basketball (Heat fan), anime, coding side projects, cooking, hiking"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Topics You Love Talking About
            </label>
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={2}
              placeholder="e.g. New tech, NBA trades, what's for dinner, weekend plans"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Topics to Avoid
            </label>
            <textarea
              value={avoidTopics}
              onChange={(e) => setAvoidTopics(e.target.value)}
              rows={2}
              placeholder="e.g. Politics, religion, anything about my ex"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </Section>

      {/* Section 3: Call behavior */}
      <Section
        title="Call Behavior"
        description="How your clone picks up and handles calls."
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Greeting
          </label>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Hello?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            What your clone says when it picks up a call from an unknown number
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unknown Caller Rules
          </label>
          <textarea
            value={callerRules}
            onChange={(e) => setCallerRules(e.target.value)}
            rows={2}
            placeholder="e.g. Chat normally but don't give out personal info. If they're selling something, politely hang up."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Section>

      {/* Section 4: People who will call */}
      <Section
        title="People Who Will Call"
        description="Add the people who will be calling your clone. The more context you give about each person, the more naturally your clone will talk to them."
      >
        {contacts.map((contact, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
          >
            {/* Contact header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100"
              onClick={() =>
                setExpandedContact(expandedContact === i ? null : i)
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {contact.name || "New contact"}
                </span>
                {contact.relationship && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {contact.relationship}
                  </span>
                )}
                {contact.phone && (
                  <span className="font-mono text-xs text-gray-400">
                    {contact.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContact(i);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
                <span className="text-gray-400 text-sm">
                  {expandedContact === i ? "\u25B2" : "\u25BC"}
                </span>
              </div>
            </div>

            {/* Expanded contact fields */}
            {expandedContact === i && (
              <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(i, "name", e.target.value)}
                      placeholder="e.g. Sarah"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(i, "phone", e.target.value)
                      }
                      placeholder="e.g. 561-555-1234"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) =>
                        updateContact(i, "relationship", e.target.value)
                      }
                      placeholder="e.g. best friend, mom, roommate"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Nickname / What You Call Them
                    </label>
                    <input
                      type="text"
                      value={contact.nickname}
                      onChange={(e) =>
                        updateContact(i, "nickname", e.target.value)
                      }
                      placeholder="e.g. Sar, Mom, Big Mike"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      How to Greet Them
                    </label>
                    <input
                      type="text"
                      value={contact.greeting}
                      onChange={(e) =>
                        updateContact(i, "greeting", e.target.value)
                      }
                      placeholder='e.g. "Yooo what&apos;s good!" or "Hey Mom!"'
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    What&apos;s This Person Like?
                  </label>
                  <textarea
                    value={contact.personality}
                    onChange={(e) =>
                      updateContact(i, "personality", e.target.value)
                    }
                    rows={2}
                    placeholder="e.g. Super outgoing, always planning something. Talks fast. Really into fitness."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    What Do You Usually Talk About?
                  </label>
                  <textarea
                    value={contact.topics}
                    onChange={(e) =>
                      updateContact(i, "topics", e.target.value)
                    }
                    rows={2}
                    placeholder="e.g. Weekend plans, gym, gossip about mutual friends, complaining about classes"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Inside Jokes / Shared References
                  </label>
                  <textarea
                    value={contact.insideJokes}
                    onChange={(e) =>
                      updateContact(i, "insideJokes", e.target.value)
                    }
                    rows={2}
                    placeholder='e.g. We always joke about "the incident" at Dave&apos;s party. She calls me "professor" because I once lectured her about coffee.'
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Anything Else
                  </label>
                  <textarea
                    value={contact.notes}
                    onChange={(e) =>
                      updateContact(i, "notes", e.target.value)
                    }
                    rows={2}
                    placeholder="Any other context that would help your clone interact naturally with this person"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addContact}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add a person
        </button>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Setup"}
        </button>

        {saved && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600">Saved!</span>
            <button
              onClick={() => router.push("/deploy")}
              className="text-sm text-blue-600 hover:underline"
            >
              Continue to Deploy →
            </button>
          </div>
        )}

        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
