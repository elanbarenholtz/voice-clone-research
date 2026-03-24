"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Contact {
  name: string;
  phone: string;
  relationship: string;
  notes: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [bio, setBio] = useState("");
  const [personality, setPersonality] = useState("");
  const [greeting, setGreeting] = useState("Hello?");
  const [callerRules, setCallerRules] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetch("/api/setup/load")
      .then((r) => r.json())
      .then((data) => {
        if (data.displayName) setDisplayName(data.displayName);
        if (data.pronunciation) setPronunciation(data.pronunciation);
        if (data.bio) setBio(data.bio);
        if (data.personality) setPersonality(data.personality);
        if (data.greeting) setGreeting(data.greeting);
        if (data.callerRules) setCallerRules(data.callerRules);
        if (data.contacts) setContacts(data.contacts);
        setLoading(false);
      });
  }, []);

  const addContact = () => {
    setContacts([...contacts, { name: "", phone: "", relationship: "", notes: "" }]);
  };

  const removeContact = (i: number) => {
    setContacts(contacts.filter((_, idx) => idx !== i));
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
        bio,
        personality,
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

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setup Your Clone</h1>
        <p className="mt-1 text-gray-600">
          Configure how your AI clone behaves on calls.
        </p>
      </div>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Name */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
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
              placeholder="How to pronounce your name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A paragraph about who you are..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Personality
          </label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            placeholder="casual, energetic, uses slang, tells jokes..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Greeting */}
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
          <p className="mt-1 text-xs text-gray-500">
            What your clone says when it picks up the phone
          </p>
        </div>

        {/* Caller Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Caller Rules
          </label>
          <textarea
            value={callerRules}
            onChange={(e) => setCallerRules(e.target.value)}
            rows={2}
            placeholder="What to do with unknown callers (take a message, chat freely, etc.)"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Contacts */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Contacts (optional)
            </label>
            <button
              onClick={addContact}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add contact
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            People your clone might recognize by caller ID
          </p>

          {contacts.map((contact, i) => (
            <div
              key={i}
              className="mt-3 grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 sm:grid-cols-4"
            >
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateContact(i, "name", e.target.value)}
                placeholder="Name"
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateContact(i, "phone", e.target.value)}
                placeholder="Phone"
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                value={contact.relationship}
                onChange={(e) => updateContact(i, "relationship", e.target.value)}
                placeholder="Relationship"
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={contact.notes}
                  onChange={(e) => updateContact(i, "notes", e.target.value)}
                  placeholder="Notes"
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => removeContact(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
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
