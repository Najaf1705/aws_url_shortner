import type { CreateResponse, CopyKey } from "../pages/Home";
import { formatExpireAt } from "../utils/formatExpireAt";
import IconBtn from "./IconButton";
import IconCheck from "./icons/IconCheck";
import IconOpen from "./icons/IconOpen";
import KvRow from "./KvRow";

type Props = {
  result: CreateResponse;
  longUrl: string;
  shortUrl: string | null;
  generationTime: string | null;
  copiedKey: CopyKey;
  expiresInText: string | null;
  copyWithFeedback: (
    key: Exclude<CopyKey, null>,
    text: string
  ) => Promise<void>;
  clearAll: () => void;
};

export default function ResultCard({
  result,
  longUrl,
  shortUrl,
  generationTime,
  copiedKey,
  expiresInText,
  copyWithFeedback,
  clearAll,
}: Props) {
  return (
    <>
      <div className="border-t-2 border-text" />

      <div className="flex justify-between items-center px-4 py-2.5">
        <div className="inline-flex items-center gap-2.5 font-mono">
          <span className="text-green-600 inline-flex">
            <IconCheck />
          </span>

          <span className="font-extrabold tracking-widest text-green-600 text-[13px]">
            GENERATED
          </span>
        </div>

        <div className="font-mono text-text text-[13px]">
          {generationTime}
        </div>
      </div>

      <div className="w-full text-text">
        <KvRow
          label="CODE"
          value={<span className="font-mono">{result.code}</span>}
          right={
            <IconBtn
              copied={copiedKey === "code"}
              onClick={() =>
                copyWithFeedback("code", result.code)
              }
              title="Copy code"
            />
          }
        />

        <KvRow
          label="SHORT URL"
          value={
            shortUrl ? (
              <a
                className="text-[#5a8cff] no-underline hover:underline font-mono"
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
              >
                {shortUrl}
              </a>
            ) : (
              <span className="text-[#666]">
                Missing API base
              </span>
            )
          }
          right={
            shortUrl && (
              <>
                <IconBtn
                  copied={copiedKey === "shortUrl"}
                  onClick={() =>
                    copyWithFeedback("shortUrl", shortUrl)
                  }
                  title="Copy short URL"
                />

                <button
                  className="w-9.5 h-8.5 border-2 border-text bg-black text-white grid place-items-center cursor-pointer"
                  onClick={() =>
                    window.open(shortUrl, "_blank")
                  }
                >
                  <IconOpen />
                </button>
              </>
            )
          }
        />

        <KvRow
          label="EXPIRES"
          value={expiresInText ?? "—"}
          right={
            <span className="text-text text-[12px] font-mono">
              {formatExpireAt(result.expireAt)}
            </span>
          }
        />

        <KvRow
          label="ORIGIN"
          value={
            <span
              className="font-mono overflow-hidden text-ellipsis whitespace-nowrap"
              title={longUrl}
            >
              {longUrl}
            </span>
          }
          right={
            <IconBtn
              copied={copiedKey === "origin"}
              onClick={() =>
                copyWithFeedback("origin", longUrl)
              }
              title="Copy origin"
            />
          }
        />

        <div className="border-t-2 border-text flex justify-end px-4 py-2.5">
          <button
            className="border-2 border-text bg-bg font-mono text-[15px] px-4.5 py-2.5 cursor-pointer"
            onClick={clearAll}
          >
            Create new
          </button>
        </div>
      </div>
    </>
  );
}