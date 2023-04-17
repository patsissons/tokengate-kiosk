import { ChangeEvent, FormEvent, useState } from "react";

export default function Debug() {
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");

  return (
    <div className="flex flex-col items-center gap-4 w-[512px] mx-auto py-16">
      <form
        className="flex flex-col items-stretch gap-4 w-full"
        onSubmit={handleSubmit}
      >
        <select className="w-full" onChange={handleFormat}>
          <option value="read">read</option>
          <option value="claim">claim</option>
          <option value="sign">sign</option>
        </select>
        <textarea
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
        />
        <button className="btn btn-primary">Submit</button>
      </form>
      <pre className="w-full">{JSON.stringify(result, null, 2)}</pre>
    </div>
  );

  function handleFormat(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === "read") {
      setBody(JSON.stringify({ action: "read" }));
    } else if (event.target.value === "claim") {
      setBody(JSON.stringify({ action: "claim", nonce: "" }));
    } else if (event.target.value === "sign") {
      setBody(
        JSON.stringify({ action: "sign", nonce: "", wallet: "", signature: "" })
      );
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    fetch("/api/debug", {
      method: "POST",
      body: body || "{}",
    })
      .then((response) => response.json())
      .then((data) => setResult(data))
      .catch(console.error);
  }
}
